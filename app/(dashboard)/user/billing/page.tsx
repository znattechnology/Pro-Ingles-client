"use client";

import Loading from "@/components/course/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/state/api";
import { useDjangoAuth } from "@/hooks/useDjangoAuth";
import React, { useState } from "react";

const UserBilling = () => {
  const [paymentType, setPaymentType] = useState("all");
  const { user, isAuthenticated, isLoading: authLoading } = useDjangoAuth();
  const { data: transactions, isLoading: isLoadingTransactions } =
    useGetTransactionsQuery(user?.id || "", {
      skip: !isAuthenticated || !user,
    });

  const filteredData =
    transactions?.filter((transaction) => {
      const matchesTypes =
        paymentType === "all" || transaction.paymentProvider === paymentType;
      return matchesTypes;
    }) || [];

  if (authLoading) return <Loading />;
  if (!user) return <div>Faça login para visualizar as suas informações de faturação.</div>;

  return (
    <div className="space-y-8">
      <div className="space-y-6 bg-customgreys-secondarybg">
        <h2 className="text-2xl font-semibold text-white">Histórico de pagamentos</h2>
        <div className="flex space-x-4">
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="w-[180px] border-none bg-customgreys-primarybg">
              <SelectValue placeholder="Tipo de pagamento" />
            </SelectTrigger>

            <SelectContent className="bg-customgreys-primarybg">
              <SelectItem className="text-white hover:!bg-white-50 hover:!text-customgreys-primarybg cursor-pointer " value="all">
              Todos os tipos
              </SelectItem>
              <SelectItem className="hover:!bg-white-50 hover:!text-customgreys-primarybg cursor-pointer" value="stripe">
                Stripe
              </SelectItem>
              <SelectItem className="hover:!bg-white-50 hover:!text-customgreys-primarybg cursor-pointer" value="paypal">
                Paypal
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[400px] w-full">
          {isLoadingTransactions ? (
            <Loading />
          ) : (
            <Table className="text-customgreys-dirtyGrey min-h-[200px]">
              <TableHeader className="bg-customgreys-darkGrey">
                <TableRow className="border-none text-white-50">
                  <TableHead className="border-none p-4">Data</TableHead>
                  <TableHead className="border-none p-4">Montante</TableHead>
                  <TableHead className="border-none p-4">
                  Método de pagamento
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-customgreys-primarybg min-h-[200px]">
                {filteredData.length > 0 ? (
                  filteredData.map((transaction) => (
                    <TableRow
                      className="border-none"
                      key={transaction.transactionId}
                    >
                      <TableCell className="border-none p-4">
                        {new Date(transaction.dateTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="billing__table-cell font-medium">
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell className="border-none p-4">
                        {transaction.paymentProvider}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-none">
                    <TableCell
                      className="border-none p-4 text-center"
                      colSpan={3}
                    >
                     Nenhuma transação para exibir
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBilling;
