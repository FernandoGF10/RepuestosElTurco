--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: estadopago; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estadopago AS ENUM (
    'no_aplica',
    'pendiente',
    'en_proceso',
    'aprobado',
    'rechazado'
);


--
-- Name: estadopedido; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estadopedido AS ENUM (
    'pendiente',
    'preparando',
    'listo',
    'entregado',
    'cancelado'
);


--
-- Name: metodopago; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.metodopago AS ENUM (
    'retiro_tienda',
    'mercado_pago'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config (
    id integer NOT NULL,
    nombre_negocio character varying(200),
    direccion character varying(300),
    telefono1 character varying(30),
    telefono2 character varying(30),
    whatsapp character varying(30),
    email character varying(200),
    horario character varying(200),
    ciudad character varying(100)
);


--
-- Name: familias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.familias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    imagen character varying(500),
    posicion integer DEFAULT 0 NOT NULL
);


--
-- Name: familias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.familias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: familias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.familias_id_seq OWNED BY public.familias.id;


--
-- Name: marcas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marcas (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    logo character varying(255),
    activa boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: marcas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.marcas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marcas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.marcas_id_seq OWNED BY public.marcas.id;


--
-- Name: modelos_auto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modelos_auto (
    id integer NOT NULL,
    marca_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean
);


--
-- Name: modelos_auto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modelos_auto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modelos_auto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modelos_auto_id_seq OWNED BY public.modelos_auto.id;


--
-- Name: motores_auto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.motores_auto (
    id integer NOT NULL,
    modelo_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean
);


--
-- Name: motores_auto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.motores_auto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: motores_auto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.motores_auto_id_seq OWNED BY public.motores_auto.id;


--
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_items (
    id uuid NOT NULL,
    pedido_id uuid NOT NULL,
    producto_id character varying(100) NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(200) NOT NULL,
    marca character varying(100) NOT NULL,
    precio integer NOT NULL,
    cantidad integer NOT NULL
);


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedidos (
    id uuid NOT NULL,
    numero character varying(20) NOT NULL,
    fecha timestamp with time zone,
    estado public.estadopedido NOT NULL,
    cliente_nombre character varying(200) NOT NULL,
    cliente_telefono character varying(30) NOT NULL,
    cliente_email character varying(200),
    total integer NOT NULL,
    notas text,
    metodo_pago public.metodopago DEFAULT 'retiro_tienda'::public.metodopago NOT NULL,
    estado_pago public.estadopago DEFAULT 'no_aplica'::public.estadopago NOT NULL,
    mp_preference_id character varying(120),
    mp_payment_id character varying(120)
);


--
-- Name: producto_compatibilidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto_compatibilidades (
    id integer NOT NULL,
    producto_id uuid NOT NULL,
    marca_id integer NOT NULL,
    modelo_id integer NOT NULL,
    motor_id integer NOT NULL,
    anio_desde integer NOT NULL,
    anio_hasta integer NOT NULL
);


--
-- Name: producto_compatibilidades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_compatibilidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_compatibilidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_compatibilidades_id_seq OWNED BY public.producto_compatibilidades.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id uuid NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(200) NOT NULL,
    categoria character varying(100) NOT NULL,
    marca character varying(100) NOT NULL,
    precio integer NOT NULL,
    descripcion text,
    detalle text,
    compatibilidad json,
    imagen_url character varying(500),
    stock integer,
    activo boolean,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone,
    familia_id integer,
    subfamilia_id integer
);


--
-- Name: subfamilias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subfamilias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    familia_id integer NOT NULL
);


--
-- Name: subfamilias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subfamilias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subfamilias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subfamilias_id_seq OWNED BY public.subfamilias.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    username character varying(50) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    activo boolean,
    creado_en timestamp with time zone,
    rol character varying(20) DEFAULT 'admin'::character varying NOT NULL
);


--
-- Name: familias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias ALTER COLUMN id SET DEFAULT nextval('public.familias_id_seq'::regclass);


--
-- Name: marcas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marcas ALTER COLUMN id SET DEFAULT nextval('public.marcas_id_seq'::regclass);


--
-- Name: modelos_auto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelos_auto ALTER COLUMN id SET DEFAULT nextval('public.modelos_auto_id_seq'::regclass);


--
-- Name: motores_auto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motores_auto ALTER COLUMN id SET DEFAULT nextval('public.motores_auto_id_seq'::regclass);


--
-- Name: producto_compatibilidades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_compatibilidades ALTER COLUMN id SET DEFAULT nextval('public.producto_compatibilidades_id_seq'::regclass);


--
-- Name: subfamilias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subfamilias ALTER COLUMN id SET DEFAULT nextval('public.subfamilias_id_seq'::regclass);


--
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);


--
-- Name: familias familias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_nombre_key UNIQUE (nombre);


--
-- Name: familias familias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.familias
    ADD CONSTRAINT familias_pkey PRIMARY KEY (id);


--
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id);


--
-- Name: modelos_auto modelos_auto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelos_auto
    ADD CONSTRAINT modelos_auto_pkey PRIMARY KEY (id);


--
-- Name: motores_auto motores_auto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motores_auto
    ADD CONSTRAINT motores_auto_pkey PRIMARY KEY (id);


--
-- Name: pedido_items pedido_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pkey PRIMARY KEY (id);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- Name: producto_compatibilidades producto_compatibilidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_compatibilidades
    ADD CONSTRAINT producto_compatibilidades_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: subfamilias subfamilias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subfamilias
    ADD CONSTRAINT subfamilias_pkey PRIMARY KEY (id);


--
-- Name: modelos_auto uq_modelo_auto_marca_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelos_auto
    ADD CONSTRAINT uq_modelo_auto_marca_nombre UNIQUE (marca_id, nombre);


--
-- Name: motores_auto uq_motor_auto_modelo_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motores_auto
    ADD CONSTRAINT uq_motor_auto_modelo_nombre UNIQUE (modelo_id, nombre);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ix_familias_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_familias_id ON public.familias USING btree (id);


--
-- Name: ix_marcas_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_marcas_id ON public.marcas USING btree (id);


--
-- Name: ix_modelos_auto_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_modelos_auto_id ON public.modelos_auto USING btree (id);


--
-- Name: ix_modelos_auto_marca_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_modelos_auto_marca_id ON public.modelos_auto USING btree (marca_id);


--
-- Name: ix_motores_auto_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_motores_auto_id ON public.motores_auto USING btree (id);


--
-- Name: ix_motores_auto_modelo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_motores_auto_modelo_id ON public.motores_auto USING btree (modelo_id);


--
-- Name: ix_pedidos_mp_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedidos_mp_payment_id ON public.pedidos USING btree (mp_payment_id);


--
-- Name: ix_pedidos_numero; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_pedidos_numero ON public.pedidos USING btree (numero);


--
-- Name: ix_producto_compatibilidades_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_producto_compatibilidades_id ON public.producto_compatibilidades USING btree (id);


--
-- Name: ix_producto_compatibilidades_marca_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_producto_compatibilidades_marca_id ON public.producto_compatibilidades USING btree (marca_id);


--
-- Name: ix_producto_compatibilidades_modelo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_producto_compatibilidades_modelo_id ON public.producto_compatibilidades USING btree (modelo_id);


--
-- Name: ix_producto_compatibilidades_motor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_producto_compatibilidades_motor_id ON public.producto_compatibilidades USING btree (motor_id);


--
-- Name: ix_producto_compatibilidades_producto_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_producto_compatibilidades_producto_id ON public.producto_compatibilidades USING btree (producto_id);


--
-- Name: ix_productos_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_productos_codigo ON public.productos USING btree (codigo);


--
-- Name: ix_subfamilias_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_subfamilias_id ON public.subfamilias USING btree (id);


--
-- Name: ix_usuarios_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_usuarios_username ON public.usuarios USING btree (username);


--
-- Name: modelos_auto modelos_auto_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modelos_auto
    ADD CONSTRAINT modelos_auto_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id) ON DELETE CASCADE;


--
-- Name: motores_auto motores_auto_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motores_auto
    ADD CONSTRAINT motores_auto_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.modelos_auto(id) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- Name: producto_compatibilidades producto_compatibilidades_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_compatibilidades
    ADD CONSTRAINT producto_compatibilidades_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id);


--
-- Name: producto_compatibilidades producto_compatibilidades_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_compatibilidades
    ADD CONSTRAINT producto_compatibilidades_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.modelos_auto(id);


--
-- Name: producto_compatibilidades producto_compatibilidades_motor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_compatibilidades
    ADD CONSTRAINT producto_compatibilidades_motor_id_fkey FOREIGN KEY (motor_id) REFERENCES public.motores_auto(id);


--
-- Name: producto_compatibilidades producto_compatibilidades_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_compatibilidades
    ADD CONSTRAINT producto_compatibilidades_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: productos productos_familia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id);


--
-- Name: productos productos_subfamilia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_subfamilia_id_fkey FOREIGN KEY (subfamilia_id) REFERENCES public.subfamilias(id);


--
-- Name: subfamilias subfamilias_familia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subfamilias
    ADD CONSTRAINT subfamilias_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES public.familias(id);


--
-- PostgreSQL database dump complete
--


