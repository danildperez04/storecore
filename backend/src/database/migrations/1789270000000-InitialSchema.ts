import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de StoreCore: 8 enums y 14 tablas.
 *
 * Este archivo es la fuente de verdad del esquema. `synchronize` está
 * desactivado en todos los entornos: el esquema se cambia SOLO por migración.
 *
 * Ver docs/10-esquema-base-de-datos.md
 */
export class InitialSchema1789270000000 implements MigrationInterface {
  name = 'InitialSchema1789270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- Enums ----------
    await queryRunner.query(`CREATE TYPE "user_role" AS ENUM ('ADMIN', 'CASHIER')`);
    await queryRunner.query(`CREATE TYPE "product_unit" AS ENUM ('UNIT', 'KG', 'LT')`);
    await queryRunner.query(
      `CREATE TYPE "stock_movement_type" AS ENUM ('PURCHASE','SALE','RETURN','ADJUSTMENT','WASTE','INITIAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "supplier_order_status" AS ENUM ('DRAFT','ORDERED','RECEIVED','CANCELLED')`,
    );
    await queryRunner.query(`CREATE TYPE "sale_status" AS ENUM ('COMPLETED', 'CANCELLED')`);
    await queryRunner.query(
      `CREATE TYPE "payment_method" AS ENUM ('CASH','CARD','TRANSFER','CREDIT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "customer_transaction_type" AS ENUM ('CHARGE', 'PAYMENT')`,
    );
    await queryRunner.query(`CREATE TYPE "cash_shift_status" AS ENUM ('OPEN', 'CLOSED')`);

    // ---------- branch ----------
    await queryRunner.query(`
      CREATE TABLE "branch" (
        "id"        SERIAL PRIMARY KEY,
        "code"      VARCHAR(10)  NOT NULL,
        "name"      VARCHAR(120) NOT NULL,
        "address"   VARCHAR(255),
        "phone"     VARCHAR(20),
        "is_active" BOOLEAN      NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_branch_code" UNIQUE ("code")
      )
    `);

    // ---------- user ----------
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id"            SERIAL PRIMARY KEY,
        "username"      VARCHAR(50)   NOT NULL,
        "email"         VARCHAR(120)  NOT NULL,
        "password_hash" VARCHAR(255)  NOT NULL,
        "full_name"     VARCHAR(120)  NOT NULL,
        "role"          "user_role"   NOT NULL DEFAULT 'CASHIER',
        "branch_id"     INTEGER,
        "is_active"     BOOLEAN       NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "uq_user_username" UNIQUE ("username"),
        CONSTRAINT "uq_user_email"    UNIQUE ("email"),
        CONSTRAINT "fk_user_branch"   FOREIGN KEY ("branch_id")
          REFERENCES "branch" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_user_branch_id" ON "user" ("branch_id")`);

    // ---------- category ----------
    await queryRunner.query(`
      CREATE TABLE "category" (
        "id"         SERIAL PRIMARY KEY,
        "name"       VARCHAR(120) NOT NULL,
        "slug"       VARCHAR(140) NOT NULL,
        "parent_id"  INTEGER,
        "icon"       VARCHAR(50),
        "is_active"  BOOLEAN      NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_category_slug" UNIQUE ("slug"),
        CONSTRAINT "fk_category_parent" FOREIGN KEY ("parent_id")
          REFERENCES "category" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_category_parent_id" ON "category" ("parent_id")`);

    // ---------- supplier ----------
    await queryRunner.query(`
      CREATE TABLE "supplier" (
        "id"           SERIAL PRIMARY KEY,
        "name"         VARCHAR(150) NOT NULL,
        "contact_name" VARCHAR(120),
        "phone"        VARCHAR(20),
        "email"        VARCHAR(120),
        "address"      VARCHAR(255),
        "notes"        TEXT,
        "is_active"    BOOLEAN      NOT NULL DEFAULT true,
        "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_supplier_name" ON "supplier" ("name")`);

    // ---------- product ----------
    await queryRunner.query(`
      CREATE TABLE "product" (
        "id"             SERIAL PRIMARY KEY,
        "sku"            VARCHAR(50)   NOT NULL,
        "barcode"        VARCHAR(50),
        "name"           VARCHAR(180)  NOT NULL,
        "description"    TEXT,
        "category_id"    INTEGER       NOT NULL,
        "supplier_id"    INTEGER,
        "unit"           "product_unit" NOT NULL DEFAULT 'UNIT',
        "purchase_price" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "sale_price"     NUMERIC(12,2) NOT NULL DEFAULT 0,
        "min_stock"      NUMERIC(12,3) NOT NULL DEFAULT 0,
        "is_active"      BOOLEAN       NOT NULL DEFAULT true,
        "created_at"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "uq_product_sku" UNIQUE ("sku"),
        -- RF-10: el precio de venta debe superar al de compra.
        CONSTRAINT "ck_product_prices" CHECK ("sale_price" > "purchase_price"),
        CONSTRAINT "ck_product_min_stock" CHECK ("min_stock" >= 0),
        CONSTRAINT "ck_product_prices_non_negative"
          CHECK ("purchase_price" >= 0 AND "sale_price" >= 0),
        CONSTRAINT "fk_product_category" FOREIGN KEY ("category_id")
          REFERENCES "category" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_product_supplier" FOREIGN KEY ("supplier_id")
          REFERENCES "supplier" ("id") ON DELETE SET NULL
      )
    `);
    // Índice único PARCIAL: permite varios productos sin código de barras.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_product_barcode" ON "product" ("barcode") WHERE "barcode" IS NOT NULL`,
    );
    await queryRunner.query(`CREATE INDEX "idx_product_name" ON "product" ("name")`);
    await queryRunner.query(`CREATE INDEX "idx_product_category_id" ON "product" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "idx_product_supplier_id" ON "product" ("supplier_id")`);

    // ---------- product_stock ----------
    await queryRunner.query(`
      CREATE TABLE "product_stock" (
        "id"         SERIAL PRIMARY KEY,
        "product_id" INTEGER        NOT NULL,
        "branch_id"  INTEGER        NOT NULL,
        "quantity"   NUMERIC(12,3)  NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ    NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ    NOT NULL DEFAULT now(),
        CONSTRAINT "uq_product_stock_pair" UNIQUE ("product_id", "branch_id"),
        -- RN-2 / RNF-03: última línea de defensa contra el stock negativo.
        CONSTRAINT "ck_product_stock_quantity" CHECK ("quantity" >= 0),
        CONSTRAINT "fk_product_stock_product" FOREIGN KEY ("product_id")
          REFERENCES "product" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_product_stock_branch" FOREIGN KEY ("branch_id")
          REFERENCES "branch" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_product_stock_branch_id" ON "product_stock" ("branch_id")`,
    );

    // ---------- stock_movement ----------
    await queryRunner.query(`
      CREATE TABLE "stock_movement" (
        "id"                SERIAL PRIMARY KEY,
        "product_id"        INTEGER        NOT NULL,
        "branch_id"         INTEGER        NOT NULL,
        "type"              "stock_movement_type" NOT NULL,
        "quantity"          NUMERIC(12,3)  NOT NULL,
        "reason"            VARCHAR(255),
        "reference"         VARCHAR(100),
        "previous_quantity" NUMERIC(12,3)  NOT NULL,
        "new_quantity"      NUMERIC(12,3)  NOT NULL,
        "user_id"           INTEGER        NOT NULL,
        "created_at"        TIMESTAMPTZ    NOT NULL DEFAULT now(),
        CONSTRAINT "ck_stock_movement_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "ck_stock_movement_new_quantity" CHECK ("new_quantity" >= 0),
        CONSTRAINT "fk_stock_movement_product" FOREIGN KEY ("product_id")
          REFERENCES "product" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_stock_movement_branch" FOREIGN KEY ("branch_id")
          REFERENCES "branch" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_stock_movement_user" FOREIGN KEY ("user_id")
          REFERENCES "user" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_stock_movement_product_id" ON "stock_movement" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_stock_movement_created_at" ON "stock_movement" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_stock_movement_branch_type" ON "stock_movement" ("branch_id", "type")`,
    );

    // ---------- supplier_order ----------
    await queryRunner.query(`
      CREATE TABLE "supplier_order" (
        "id"           SERIAL PRIMARY KEY,
        "order_number" VARCHAR(20) NOT NULL,
        "supplier_id"  INTEGER     NOT NULL,
        "branch_id"    INTEGER     NOT NULL,
        "status"       "supplier_order_status" NOT NULL DEFAULT 'DRAFT',
        "ordered_at"   TIMESTAMPTZ,
        "received_at"  TIMESTAMPTZ,
        "subtotal"     NUMERIC(12,2) NOT NULL DEFAULT 0,
        "total"        NUMERIC(12,2) NOT NULL DEFAULT 0,
        "notes"        TEXT,
        "user_id"      INTEGER     NOT NULL,
        "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_supplier_order_number" UNIQUE ("order_number"),
        CONSTRAINT "ck_supplier_order_amounts" CHECK ("subtotal" >= 0 AND "total" >= 0),
        CONSTRAINT "fk_supplier_order_supplier" FOREIGN KEY ("supplier_id")
          REFERENCES "supplier" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_supplier_order_branch" FOREIGN KEY ("branch_id")
          REFERENCES "branch" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_supplier_order_user" FOREIGN KEY ("user_id")
          REFERENCES "user" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_supplier_order_status" ON "supplier_order" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_supplier_order_supplier_id" ON "supplier_order" ("supplier_id")`,
    );

    // ---------- supplier_order_item ----------
    await queryRunner.query(`
      CREATE TABLE "supplier_order_item" (
        "id"                SERIAL PRIMARY KEY,
        "order_id"          INTEGER        NOT NULL,
        "product_id"        INTEGER        NOT NULL,
        "quantity"          NUMERIC(12,3)  NOT NULL,
        "received_quantity" NUMERIC(12,3)  NOT NULL DEFAULT 0,
        "unit_cost"         NUMERIC(12,2)  NOT NULL,
        "subtotal"          NUMERIC(12,2)  NOT NULL,
        CONSTRAINT "ck_supplier_order_item_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "ck_supplier_order_item_received" CHECK ("received_quantity" >= 0),
        CONSTRAINT "ck_supplier_order_item_unit_cost" CHECK ("unit_cost" >= 0),
        CONSTRAINT "fk_supplier_order_item_order" FOREIGN KEY ("order_id")
          REFERENCES "supplier_order" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_supplier_order_item_product" FOREIGN KEY ("product_id")
          REFERENCES "product" ("id") ON DELETE RESTRICT
      )
    `);

    // ---------- customer ----------
    await queryRunner.query(`
      CREATE TABLE "customer" (
        "id"           SERIAL PRIMARY KEY,
        "name"         VARCHAR(150)  NOT NULL,
        "phone"        VARCHAR(20),
        "address"      VARCHAR(255),
        -- RN-6: NO existe columna balance; el adeudo se deriva sumando
        -- customer_transaction.
        "credit_limit" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "notes"        TEXT,
        "is_active"    BOOLEAN       NOT NULL DEFAULT true,
        "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "ck_customer_credit_limit" CHECK ("credit_limit" >= 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_customer_name" ON "customer" ("name")`);

    // ---------- sale ----------
    await queryRunner.query(`
      CREATE TABLE "sale" (
        "id"                  SERIAL PRIMARY KEY,
        "sale_number"         VARCHAR(20) NOT NULL,
        "branch_id"           INTEGER NOT NULL,
        "user_id"             INTEGER NOT NULL,
        "customer_id"         INTEGER,
        "cash_shift_id"       INTEGER,
        "status"              "sale_status" NOT NULL DEFAULT 'COMPLETED',
        "payment_method"      "payment_method" NOT NULL,
        "subtotal"            NUMERIC(12,2) NOT NULL DEFAULT 0,
        "discount"            NUMERIC(12,2) NOT NULL DEFAULT 0,
        "total"               NUMERIC(12,2) NOT NULL DEFAULT 0,
        "amount_received"     NUMERIC(12,2),
        "change_given"        NUMERIC(12,2),
        "cancelled_at"        TIMESTAMPTZ,
        "cancelled_by_id"     INTEGER,
        "cancellation_reason" VARCHAR(255),
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
        -- RF-27: el folio es único POR SUCURSAL.
        CONSTRAINT "uq_sale_branch_number" UNIQUE ("branch_id", "sale_number"),
        -- RN-7: el total se deriva de los renglones.
        CONSTRAINT "ck_sale_totals" CHECK ("total" = "subtotal" - "discount"),
        CONSTRAINT "ck_sale_amounts_non_negative"
          CHECK ("subtotal" >= 0 AND "discount" >= 0 AND "total" >= 0),
        CONSTRAINT "fk_sale_branch" FOREIGN KEY ("branch_id")
          REFERENCES "branch" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_sale_user" FOREIGN KEY ("user_id")
          REFERENCES "user" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_sale_customer" FOREIGN KEY ("customer_id")
          REFERENCES "customer" ("id") ON DELETE SET NULL,
        CONSTRAINT "fk_sale_cancelled_by" FOREIGN KEY ("cancelled_by_id")
          REFERENCES "user" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_sale_created_at" ON "sale" ("created_at")`);
    await queryRunner.query(
      `CREATE INDEX "idx_sale_branch_status" ON "sale" ("branch_id", "status")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_sale_customer_id" ON "sale" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sale_cash_shift_id" ON "sale" ("cash_shift_id")`);

    // ---------- sale_item ----------
    await queryRunner.query(`
      CREATE TABLE "sale_item" (
        "id"         SERIAL PRIMARY KEY,
        "sale_id"    INTEGER       NOT NULL,
        "product_id" INTEGER       NOT NULL,
        "quantity"   NUMERIC(12,3) NOT NULL,
        -- unit_price y cost_price se CONGELAN al vender (RF-47).
        "unit_price" NUMERIC(12,2) NOT NULL,
        "discount"   NUMERIC(12,2) NOT NULL DEFAULT 0,
        "subtotal"   NUMERIC(12,2) NOT NULL,
        "cost_price" NUMERIC(12,2) NOT NULL,
        CONSTRAINT "ck_sale_item_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "ck_sale_item_amounts" CHECK ("unit_price" >= 0 AND "discount" >= 0),
        CONSTRAINT "ck_sale_item_subtotal" CHECK ("subtotal" >= 0),
        CONSTRAINT "fk_sale_item_sale" FOREIGN KEY ("sale_id")
          REFERENCES "sale" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_sale_item_product" FOREIGN KEY ("product_id")
          REFERENCES "product" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_sale_item_sale_id" ON "sale_item" ("sale_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_sale_item_product_id" ON "sale_item" ("product_id")`,
    );

    // ---------- cash_shift ----------
    await queryRunner.query(`
      CREATE TABLE "cash_shift" (
        "id"              SERIAL PRIMARY KEY,
        "branch_id"       INTEGER       NOT NULL,
        "user_id"         INTEGER       NOT NULL,
        "status"          "cash_shift_status" NOT NULL DEFAULT 'OPEN',
        "opening_amount"  NUMERIC(12,2) NOT NULL DEFAULT 0,
        "closing_amount"  NUMERIC(12,2),
        "expected_amount" NUMERIC(12,2),
        "difference"      NUMERIC(12,2),
        "sales_cash"      NUMERIC(12,2) NOT NULL DEFAULT 0,
        "sales_card"      NUMERIC(12,2) NOT NULL DEFAULT 0,
        "sales_transfer"  NUMERIC(12,2) NOT NULL DEFAULT 0,
        "sales_total"     NUMERIC(12,2) NOT NULL DEFAULT 0,
        "opened_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "closed_at"       TIMESTAMPTZ,
        "notes"           TEXT,
        "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "ck_cash_shift_opening" CHECK ("opening_amount" >= 0),
        CONSTRAINT "fk_cash_shift_branch" FOREIGN KEY ("branch_id")
          REFERENCES "branch" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_cash_shift_user" FOREIGN KEY ("user_id")
          REFERENCES "user" ("id") ON DELETE RESTRICT
      )
    `);
    // Una sola caja ABIERTA por sucursal (RF-29).
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_cash_shift_open" ON "cash_shift" ("branch_id") WHERE "status" = 'OPEN'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cash_shift_branch_id" ON "cash_shift" ("branch_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cash_shift_opened_at" ON "cash_shift" ("opened_at")`,
    );

    // ---------- customer_transaction ----------
    await queryRunner.query(`
      CREATE TABLE "customer_transaction" (
        "id"          SERIAL PRIMARY KEY,
        "customer_id" INTEGER       NOT NULL,
        "type"        "customer_transaction_type" NOT NULL,
        "amount"      NUMERIC(12,2) NOT NULL,
        "sale_id"     INTEGER,
        "user_id"     INTEGER       NOT NULL,
        "notes"       VARCHAR(255),
        "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "ck_customer_transaction_amount" CHECK ("amount" > 0),
        CONSTRAINT "fk_customer_transaction_customer" FOREIGN KEY ("customer_id")
          REFERENCES "customer" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_customer_transaction_sale" FOREIGN KEY ("sale_id")
          REFERENCES "sale" ("id") ON DELETE SET NULL,
        CONSTRAINT "fk_customer_transaction_user" FOREIGN KEY ("user_id")
          REFERENCES "user" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_customer_transaction_customer_id" ON "customer_transaction" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_customer_transaction_created_at" ON "customer_transaction" ("created_at")`,
    );

    // La venta referencia la caja abierta; se agrega al final para evitar ciclo.
    await queryRunner.query(
      `ALTER TABLE "sale" ADD CONSTRAINT "fk_sale_cash_shift" FOREIGN KEY ("cash_shift_id") REFERENCES "cash_shift" ("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT IF EXISTS "fk_sale_cash_shift"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_transaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cash_shift"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customer"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "supplier_order_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "supplier_order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_movement"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_stock"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "supplier"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "category"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branch"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "cash_shift_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "customer_transaction_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sale_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "supplier_order_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stock_movement_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "product_unit"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
