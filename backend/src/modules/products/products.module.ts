import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { Product } from './entities/product.entity.js';
import { ProductStock } from './entities/product-stock.entity.js';
import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductStock, StockMovement, Category, Supplier])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
