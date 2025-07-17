-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.forecasts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id bigint,
  forecast integer NOT NULL,
  actual integer,
  forecast_date date NOT NULL,
  accuracy character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id bigint,
  product_category_id bigint,
  CONSTRAINT forecasts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_forecasts_product_category FOREIGN KEY (product_category_id) REFERENCES public.product_categories(id),
  CONSTRAINT fk_forecasts_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.locations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id bigint NOT NULL,
  name character varying NOT NULL,
  address text,
  type USER-DEFINED NOT NULL DEFAULT 'shop'::location_type,
  phone character varying,
  email character varying UNIQUE,
  working_hours text,
  responsible_person_id uuid,
  status USER-DEFINED NOT NULL DEFAULT 'operating'::location_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.manufacturers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id bigint NOT NULL,
  CONSTRAINT manufacturers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.operations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id bigint NOT NULL,
  operation_type USER-DEFINED NOT NULL,
  operation_date timestamp with time zone NOT NULL,
  product_id bigint NOT NULL,
  location_id bigint NOT NULL,
  supplier_id bigint,
  quantity numeric NOT NULL,
  total_amount numeric,
  cost_price numeric,
  shelf_price numeric,
  stock_on_hand integer,
  delivery_delay_days integer,
  was_out_of_stock boolean,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT operations_pkey PRIMARY KEY (id),
  CONSTRAINT operations_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT operations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT operations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT operations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT operations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.organizations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL UNIQUE,
  inn_or_ogrn character varying UNIQUE,
  legal_address text,
  actual_address text,
  phone character varying,
  email character varying UNIQUE,
  website character varying,
  description text,
  logo_url character varying,
  status USER-DEFINED NOT NULL DEFAULT 'active'::organization_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.out_of_stock_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  location_id bigint NOT NULL,
  quantity_needed integer DEFAULT 1,
  priority USER-DEFINED DEFAULT 'medium'::item_priority,
  notes text,
  status USER-DEFINED DEFAULT 'pending'::item_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  product_id bigint,
  CONSTRAINT out_of_stock_items_pkey PRIMARY KEY (id),
  CONSTRAINT out_of_stock_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT out_of_stock_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.permissions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prediction_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  days_predicted integer NOT NULL,
  overall_mape numeric,
  overall_mae numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id bigint,
  CONSTRAINT prediction_runs_pkey PRIMARY KEY (id),
  CONSTRAINT prediction_runs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.prediction_runs_old (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  run_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  days_predicted integer NOT NULL,
  overall_mape numeric,
  overall_mae numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id integer,
  CONSTRAINT prediction_runs_old_pkey PRIMARY KEY (id)
);
CREATE TABLE public.predictions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  prediction_run_id uuid NOT NULL,
  product_id bigint NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  predicted_quantity numeric NOT NULL,
  item_mape numeric,
  item_mae numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT predictions_pkey PRIMARY KEY (id),
  CONSTRAINT predictions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT predictions_prediction_run_id_fkey FOREIGN KEY (prediction_run_id) REFERENCES public.prediction_runs(id)
);
CREATE TABLE public.product_categories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id bigint NOT NULL,
  CONSTRAINT product_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_groups (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id bigint NOT NULL,
  CONSTRAINT product_groups_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_kinds (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id bigint NOT NULL,
  CONSTRAINT product_kinds_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id bigint NOT NULL,
  name character varying NOT NULL,
  sku character varying UNIQUE,
  code character varying UNIQUE,
  article character varying,
  price numeric NOT NULL DEFAULT 0.00,
  weight numeric,
  shelf_life_hours integer,
  manufacturer_id bigint,
  product_category_id bigint,
  product_group_id bigint,
  product_kind_id bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_manufacturer_id_fkey FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id),
  CONSTRAINT products_product_category_id_fkey FOREIGN KEY (product_category_id) REFERENCES public.product_categories(id),
  CONSTRAINT products_product_group_id_fkey FOREIGN KEY (product_group_id) REFERENCES public.product_groups(id),
  CONSTRAINT products_product_kind_id_fkey FOREIGN KEY (product_kind_id) REFERENCES public.product_kinds(id)
);
CREATE TABLE public.role_permissions (
  role_id bigint NOT NULL,
  permission_id bigint NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.role_users (
  user_id uuid NOT NULL,
  role_id bigint NOT NULL,
  CONSTRAINT role_users_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT role_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT role_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.roles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  organization_id bigint NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sales_input (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  period date NOT NULL,
  nomenclature character varying NOT NULL,
  nomenclature_type character varying,
  supplier character varying,
  manufacturer character varying,
  weight numeric,
  article character varying,
  code character varying NOT NULL,
  product_group character varying,
  quantity integer NOT NULL,
  sum numeric,
  shelf_life_hours integer,
  product_available boolean,
  product_available_in_store boolean,
  product_category character varying,
  delivery_delay_days integer,
  store_address text,
  product_ran_out boolean,
  shelf_price numeric,
  store_working_hours integer,
  store_remainder integer,
  location_id bigint,
  product_id bigint,
  supplier_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  organization_id bigint,
  price numeric,
  CONSTRAINT sales_input_pkey PRIMARY KEY (id),
  CONSTRAINT fk_sales_input_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id),
  CONSTRAINT fk_sales_input_location_id FOREIGN KEY (location_id) REFERENCES public.locations(id)
);
CREATE TABLE public.suppliers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  organization_id bigint NOT NULL,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_preferences (
  id integer NOT NULL DEFAULT nextval('user_preferences_id_seq'::regclass),
  user_id uuid NOT NULL UNIQUE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  full_name character varying,
  organization_id bigint NOT NULL,
  default_location_id bigint,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role character varying,
  location_id bigint,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_default_location_id_fkey FOREIGN KEY (default_location_id) REFERENCES public.locations(id),
  CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);