'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Users } from "lucide-react"
import Link from 'next/link'

export default function CMSTestimonialsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/cms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao CMS
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Depoimentos</h2>
            <p className="text-muted-foreground">
              Testemunhos de clientes satisfeitos
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Depoimentos de Clientes
          </CardTitle>
          <CardDescription>
            Esta página está em desenvolvimento. Por enquanto, use o admin Django.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Gerenciar Depoimentos</h3>
            <p className="text-muted-foreground mb-6">
              A interface para gerenciar depoimentos de clientes será implementada em breve. 
              Por enquanto, utilize o admin Django.
            </p>
            <Button asChild>
              <a 
                href="http://localhost:8000/admin/cms/testimonial/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Admin Django
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}