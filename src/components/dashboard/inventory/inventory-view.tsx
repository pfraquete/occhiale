"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryMovementsTable } from "./inventory-movements-table";
import { ABCList } from "./abc-list";
import { InventoryProductsTable } from "./inventory-products-table";

import { InventoryMovement, ABCAnalysis } from "@/lib/types/inventory";
import { Database } from "@/lib/types/database";

type Product = Pick<Database["public"]["Tables"]["products"]["Row"], "id" | "name" | "brand" | "category" | "price" | "compare_price" | "stock_qty" | "is_active" | "images" | "created_at" | "sku">;

interface InventoryViewProps {
    storeId: string;
    recentMovements: InventoryMovement[];
    topABCProducts: ABCAnalysis[];
    fullMovements: InventoryMovement[];
    fullABC: ABCAnalysis[];
    products: Product[];
}

export function InventoryView({
    storeId,
    recentMovements,
    topABCProducts,
    fullMovements,
    fullABC,
    products
}: InventoryViewProps) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview" activeValue={activeTab} onClick={setActiveTab}>Visão Geral</TabsTrigger>
                <TabsTrigger value="products" activeValue={activeTab} onClick={setActiveTab}>Produtos</TabsTrigger>
                <TabsTrigger value="movements" activeValue={activeTab} onClick={setActiveTab}>Movimentações</TabsTrigger>
                <TabsTrigger value="abc" activeValue={activeTab} onClick={setActiveTab}>Curva ABC</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" activeValue={activeTab}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 shadow-none">
                        <CardHeader>
                            <CardTitle>Movimentações Recentes</CardTitle>
                            <CardDescription>Ultimas 10 alterações no estoque.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InventoryMovementsTable movements={recentMovements} variant="compact" />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 shadow-none">
                        <CardHeader>
                            <CardTitle>Top Produtos (Curva A)</CardTitle>
                            <CardDescription>Produtos que geram 70% da sua receita.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ABCList items={topABCProducts} />
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="products" activeValue={activeTab}>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Produtos e Lotes</CardTitle>
                        <CardDescription>Gerencie a entrada de novos lotes e acompanhe o estoque total.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InventoryProductsTable products={products} storeId={storeId} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="movements" activeValue={activeTab}>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Histórico de Movimentações</CardTitle>
                        <CardDescription>Auditoria completa de entradas e saídas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InventoryMovementsTable movements={fullMovements} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="abc" activeValue={activeTab}>
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Análise da Curva ABC</CardTitle>
                        <CardDescription>Classificação de produtos por contribuição na receita.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ABCList items={fullABC} showDetails />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
