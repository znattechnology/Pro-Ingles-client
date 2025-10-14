'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Megaphone } from "lucide-react"
import Link from 'next/link'

export default function CMSCTAsPage() {
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
            <h2 className="text-3xl font-bold tracking-tight">Call to Actions</h2>
            <p className="text-muted-foreground">
              Chamadas para ação na página
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Calls to Action
          </CardTitle>
          <CardDescription>
            Esta página está em desenvolvimento. Por enquanto, use o admin Django.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Gerenciar CTAs</h3>
            <p className="text-muted-foreground mb-6">
              A interface para gerenciar chamadas para ação será implementada em breve. 
              Por enquanto, utilize o admin Django.
            </p>
            <Button asChild>
              <a 
                href="http://localhost:8000/admin/cms/calltoaction/" 
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