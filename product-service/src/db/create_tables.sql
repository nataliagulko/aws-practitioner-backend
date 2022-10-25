CREATE TABLE products (
	id uuid primary key default uuid_generate_v4(),
	title text NOT NULL,
	description text NULL,
	price int NULL
)

CREATE TABLE stocks (
	product_id uuid,
	count int,
	foreign key("product_id") references "products" ("id")
);

create extension if not exists "uuid-ossp"