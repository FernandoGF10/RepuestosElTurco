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
-- Data for Name: config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.config (id, nombre_negocio, direccion, telefono1, telefono2, whatsapp, email, horario, ciudad) FROM stdin;
1	Repuestos El Turco	Av. Principal 1234, Local 5	+56 9 7742 4442	+56 9 6629 3400	+56977424442	contacto@repuestoselturco.cl	Lun-Vie 9:00-18:00 | Sáb 10:00-14:00	Santiago, Chile
\.


--
-- Data for Name: familias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.familias (id, nombre, imagen, posicion) FROM stdin;
1	Motor	/familias/motor.jpg	0
2	Encendido y Eléctrico	/familias/electrico.jpg	0
3	Frenos	/familias/frenos.jpg	0
4	Suspensión y Dirección	/familias/suspension.jpg	0
5	Transmisión	/familias/transmision.jpg	0
6	Refrigeración y Calefacción	/familias/refrigeracion.jpg	0
7	Filtros y Lubricación	/familias/filtros.jpg	0
8	Combustible	/familias/combustible.jpg	0
9	Iluminación	/familias/iluminacion.jpg	0
10	Carrocería	/familias/carroceria.jpg	0
\.


--
-- Data for Name: marcas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marcas (id, nombre, logo, activa, created_at) FROM stdin;
2	Peugeot	/logos/peugeot.png	t	2026-06-11 11:56:02.533311-04
3	Citroën	/logos/citroen.png	t	2026-06-11 11:56:14.327431-04
4	Renault	/logos/renault.png	t	2026-06-11 11:56:41.200167-04
5	Chevrolet	/logos/chevrolet.png	t	2026-06-11 11:56:53.584823-04
6	DFM	/logos/dfm.png	t	2026-06-11 11:57:06.525825-04
10	Opel	/logos/opel.png	t	2026-06-11 15:27:22.32015-04
\.


--
-- Data for Name: modelos_auto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modelos_auto (id, marca_id, nombre, activo) FROM stdin;
1	2	408	t
2	2	308	t
3	2	208	t
4	2	207	t
5	2	206	t
6	3	Berlingo	t
7	3	C4	t
8	3	C3 Aircross	t
9	3	C3	t
10	4	Megane III	t
11	4	Fluence	t
12	4	Duster	t
13	4	Symbol	t
14	4	Logan	t
15	4	Sandero	t
16	4	Kangoo	t
17	4	Clio	t
18	5	Onix	t
19	5	Tracker	t
20	5	Cruze	t
21	5	Prisma	t
22	5	Agile	t
23	5	Corsa	t
24	6	Minivan	t
25	10	Astra	t
26	10	Corsa	t
\.


--
-- Data for Name: motores_auto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.motores_auto (id, modelo_id, nombre, activo) FROM stdin;
1	1	2.0 HDi	t
2	1	1.6 THP	t
3	2	2.0 HDi	t
4	2	1.6 Nafta	t
5	3	1.6 THP	t
6	3	1.6 Nafta	t
7	4	1.6 Nafta	t
8	4	1.4 Nafta	t
9	5	1.6 Nafta	t
10	5	1.4 Nafta	t
11	6	1.6 HDi	t
12	6	1.6 Nafta	t
13	7	2.0 HDi	t
14	7	1.6 Nafta	t
15	8	1.6 THP	t
16	8	1.6 Nafta	t
17	9	1.6 Nafta	t
18	9	1.4 Nafta	t
19	10	2.0 Nafta	t
20	10	1.6 Nafta	t
21	11	2.0 Nafta	t
22	11	1.6 Nafta	t
23	12	1.5 dCi	t
24	12	2.0 Nafta	t
25	12	1.6 Nafta	t
26	13	1.6 Nafta	t
27	14	1.5 dCi	t
28	14	1.6 Nafta	t
29	15	0.9 Turbo	t
30	15	1.6 Nafta	t
31	16	1.5 dCi	t
32	16	1.6 Nafta	t
33	17	1.6 Nafta	t
34	17	1.2 Nafta	t
35	18	1.4 Nafta	t
36	18	1.0 Turbo	t
37	19	1.8 Nafta	t
38	19	1.4 Turbo	t
39	20	1.8 Nafta	t
40	20	1.4 Turbo	t
41	21	1.4 Nafta	t
42	22	1.4 Nafta	t
43	23	1.6 Nafta	t
44	23	1.4 Nafta	t
45	24	1.5 Nafta	t
46	25	2.0 Nafta	t
47	25	1.6 Nafta	t
48	26	1.6 Nafta	t
49	26	1.4 Nafta	t
\.


--
-- Data for Name: pedido_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido_items (id, pedido_id, producto_id, codigo, nombre, marca, precio, cantidad) FROM stdin;
82695b28-8a7e-475b-b2fb-4dd44c0482be	b3df1a8f-04cb-4e06-bc0d-19223da36f19	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	2
c54e8e92-f6d1-4180-b7d0-8b92ae408773	8ebc95d4-b193-43a6-8841-8c6cc94e084b	abc	AMG-001	Amortiguador	Monroe	45990	2
b612223c-83ba-4558-abc9-7cb2d960ad29	d451aee0-6d3c-47c8-b575-caee46d7990d	80b27927-c20b-48af-959f-1780d4478797	DSF-008	Disco de Freno Ventilado	Brembo	38500	1
2f70ba98-89f9-483c-846b-f5c0b8222d1c	bf75b8f4-6a64-4c74-9b64-b7c9bb6c8cea	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	2
10066239-4907-4e0a-a036-4ee8867a71fc	d0bb74fb-4ae6-4a61-a64d-8c562e670d2c	80b27927-c20b-48af-959f-1780d4478797	DSF-008	Disco de Freno Ventilado	Brembo	38500	1
f60750d3-d55b-4423-8b5d-3a4ae5c3fdc4	2cfdd7dd-57b8-4e0c-94fd-ffadea510a34	4d3e35fc-f24c-4ce2-92dd-5d071e63ce61	PFR-004	Pastillas de Freno Delanteras	Ferodo	22500	1
6353391c-1691-46f9-b36b-87ca5fdc968e	ed03888a-6c69-47a0-9100-243f998113a6	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	1
4544fbcc-09d0-48b4-862d-671499057fff	cba86963-3fdc-46ed-935c-f85f370f72c3	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	1
19fbcfdf-a175-496e-b81e-9395eb02eaf5	ce280d55-df07-4ef4-92e0-3af7feef44fb	505b3694-7453-4dc0-8f43-ed8573d30ad1	CRR-007	Correa de Distribución	Gates	28700	1
ee09f00c-0546-4312-b8a9-5396785f9954	191ee3ab-ae3f-450e-992e-b052f478b727	80b27927-c20b-48af-959f-1780d4478797	DSF-008	Disco de Freno Ventilado	Brembo	38500	1
49eb7e6c-9090-4cef-9828-91c7b9a10386	c65f0ada-ab3a-4f97-8683-87b8b4c9ad4e	505b3694-7453-4dc0-8f43-ed8573d30ad1	CRR-007	Correa de Distribución	Gates	28700	1
bb7dc7f3-44e3-432f-a989-6f8edc374239	838a9113-764f-4280-b5c3-d3b8dcbcd628	test-1	AMG-001	Amortiguador Delantero	Monroe	45990	1
8b5a63ea-a755-4a51-8369-4569a0924ee1	93e1a837-6bc5-40ac-943b-df35bf93e7f0	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	1
78991038-7d23-4c9a-81b7-734f922fbac8	2a4bc804-8a46-4d09-a56e-c990d77a8b76	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	1
3140e6eb-e8ce-4d4a-b57c-48f95f1c0913	c16c1824-a8d4-49af-8108-fb4656f00f94	22ed076e-5cac-4bdd-bad3-7a60d04c1e4a	RAD-002	Radiador de Calefacción	Valeo	32500	1
43eaae4e-4358-4684-a2e2-263989595398	66793994-8083-4fa9-be1b-eaae296faff2	4d3e35fc-f24c-4ce2-92dd-5d071e63ce61	PFR-004	Pastillas de Freno Delanteras	Ferodo	22500	1
ecea9d06-371e-462e-98b4-4788c5a23a05	288f6aa2-5730-4997-b3d5-6d6550d3d684	9c2adcd7-0747-4406-8143-d0dd4db5ee8f	FLT-005	Filtro de Aceite	Mann Filter	8900	1
8812ecc7-1a27-4d44-afd7-e8b2ab36fc03	80247bd5-8150-49a7-96ab-bfc81569a1bf	80b27927-c20b-48af-959f-1780d4478797	DSF-008	Disco de Freno Ventilado	Brembo	38500	1
fc4d465d-d673-44f2-a5b0-9d551eaf4f96	2216cac5-e5d4-46f8-a401-de951dfecb9d	d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Monroe	45990	1
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedidos (id, numero, fecha, estado, cliente_nombre, cliente_telefono, cliente_email, total, notas, metodo_pago, estado_pago, mp_preference_id, mp_payment_id) FROM stdin;
b3df1a8f-04cb-4e06-bc0d-19223da36f19	P-1001	2026-05-28 17:55:11.243304-04	pendiente	diego	942497662		91980		retiro_tienda	no_aplica	\N	\N
8ebc95d4-b193-43a6-8841-8c6cc94e084b	P-1002	2026-05-28 17:57:03.504237-04	pendiente	Diego Test	+56912345678	test@test.cl	91980		retiro_tienda	no_aplica	\N	\N
d451aee0-6d3c-47c8-b575-caee46d7990d	P-1003	2026-05-28 18:03:50.928378-04	pendiente	diego	912345678		38500		retiro_tienda	no_aplica	\N	\N
bf75b8f4-6a64-4c74-9b64-b7c9bb6c8cea	P-1004	2026-05-28 19:28:09.727374-04	pendiente	Test Cliente	+56912345678	test@test.cl	91980	Prueba de checkout	retiro_tienda	no_aplica	\N	\N
d0bb74fb-4ae6-4a61-a64d-8c562e670d2c	P-1005	2026-05-28 19:46:42.317761-04	pendiente	diego	912345678		38500		retiro_tienda	no_aplica	\N	\N
2cfdd7dd-57b8-4e0c-94fd-ffadea510a34	P-1006	2026-05-28 20:26:33.593691-04	pendiente	fernando	912345678		22500		retiro_tienda	no_aplica	\N	\N
ed03888a-6c69-47a0-9100-243f998113a6	P-1007	2026-06-04 20:42:23.930132-04	cancelado	diego	91234567		45990		retiro_tienda	no_aplica	\N	\N
cba86963-3fdc-46ed-935c-f85f370f72c3	P-1008	2026-06-30 22:31:38.415303-04	pendiente	Juan Pérez	+56912345678	juan@correo.cl	45990		retiro_tienda	no_aplica	\N	\N
ce280d55-df07-4ef4-92e0-3af7feef44fb	P-1009	2026-07-01 00:13:59.026371-04	pendiente	carlos palacios	+56912345678		28700		mercado_pago	pendiente	3510291622-21b53400-cc6a-459b-b304-214c713e41c4	\N
191ee3ab-ae3f-450e-992e-b052f478b727	P-1010	2026-07-01 00:20:51.722593-04	pendiente	carlos palacios	+56912345678		38500		retiro_tienda	no_aplica	\N	\N
c65f0ada-ab3a-4f97-8683-87b8b4c9ad4e	P-1011	2026-07-01 00:25:24.878128-04	pendiente	diego rivarola	+56912345678		28700		retiro_tienda	no_aplica	\N	\N
838a9113-764f-4280-b5c3-d3b8dcbcd628	P-1012	2026-07-01 00:36:55.020066-04	pendiente	Test QA Brick2	+56966666666		45990		retiro_tienda	no_aplica	\N	\N
93e1a837-6bc5-40ac-943b-df35bf93e7f0	P-1013	2026-07-01 00:57:43.407065-04	preparando	Test Verificacion	+56912345678	test.verificacion@example.com	45990	Pedido de verificacion QA	mercado_pago	aprobado	\N	1327571942
2a4bc804-8a46-4d09-a56e-c990d77a8b76	P-1014	2026-07-01 00:58:44.507685-04	preparando	Test Rechazo	+56911112222	rechazo@example.com	45990		mercado_pago	aprobado	\N	1347827151
c16c1824-a8d4-49af-8108-fb4656f00f94	P-1015	2026-07-01 01:01:16.613059-04	preparando	fernando Gonzales	+56912345678		32500		mercado_pago	aprobado	\N	1347827155
66793994-8083-4fa9-be1b-eaae296faff2	P-1016	2026-07-01 19:20:26.202271-04	preparando	cota canales	+56942497662		22500		mercado_pago	aprobado	\N	1347868685
288f6aa2-5730-4997-b3d5-6d6550d3d684	P-1017	2026-07-01 19:22:17.246286-04	pendiente	juanito pereira	+56912345678		8900		retiro_tienda	no_aplica	\N	\N
80247bd5-8150-49a7-96ab-bfc81569a1bf	P-1018	2026-07-01 19:29:33.690813-04	preparando	asd	+567899876543		38500		mercado_pago	aprobado	\N	1347861175
2216cac5-e5d4-46f8-a401-de951dfecb9d	P-1019	2026-07-01 20:22:16.980894-04	preparando	Test Usuario	+56912345678	test@example.com	45990		mercado_pago	aprobado	\N	1347861621
\.


--
-- Data for Name: producto_compatibilidades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto_compatibilidades (id, producto_id, marca_id, modelo_id, motor_id, anio_desde, anio_hasta) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id, codigo, nombre, categoria, marca, precio, descripcion, detalle, compatibilidad, imagen_url, stock, activo, creado_en, actualizado_en, familia_id, subfamilia_id) FROM stdin;
b8484791-a217-4c17-8f3b-833169a366c2	BBA-006	Bobina de Encendido	Eléctrico	Bosch	35000	Bobina de encendido electrónica alto voltaje para sistemas de inyección.	Bobina de encendido de alto voltaje con núcleo ferromagnético de alta permeabilidad. Compatible con sistemas de encendido electrónico e inyección directa. Resistente a vibraciones y temperaturas extremas. Conector original incluido.	[{"auto": "Peugeot 208", "anios": "2012-2023"}, {"auto": "Citro\\u00ebn C3 Aircross", "anios": "2017-2023"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "2008-2021"}]		10	t	2026-05-28 17:48:30.180931-04	2026-05-28 17:48:30.180931-04	2	7
4d3e35fc-f24c-4ce2-92dd-5d071e63ce61	PFR-004	Pastillas de Freno Delanteras	Frenos	Ferodo	22500	Juego de pastillas semimetálicas de alto rendimiento, bajo ruido.	Pastillas de freno semimetálicas de alto rendimiento. Excelente frenado en seco y mojado. Baja generación de polvo y ruido. Cumple normas ECE R90. Incluye 4 pastillas por juego con indicador de desgaste.	[{"auto": "Chevrolet Corsa", "anios": "1994-2012"}, {"auto": "Chevrolet Agile", "anios": "2009-2014"}, {"auto": "Chevrolet Prisma", "anios": "2012-2020"}]		10	t	2026-05-28 17:48:30.180927-04	2026-05-28 17:48:30.180927-04	3	14
22ed076e-5cac-4bdd-bad3-7a60d04c1e4a	RAD-002	Radiador de Calefacción	Calefacción	Valeo	32500	Radiador de calefacción interior aluminio/cobre, calefacción eficiente.	Radiador de calefacción fabricado en aluminio y cobre de alta conductividad térmica. Proporciona calefacción eficiente para el habitáculo del vehículo. Fácil instalación, sellado hermético y alta durabilidad. Certificación OEM.	[{"auto": "Peugeot 308", "anios": "2007-2021"}, {"auto": "Peugeot 408", "anios": "2010-2022"}, {"auto": "Citro\\u00ebn C4", "anios": "2004-2020"}]		10	t	2026-05-28 17:48:30.180923-04	2026-05-28 17:48:30.180923-04	6	26
af45d286-7d84-4e05-adf5-f2e1360ce512	TDD-003	Terminal de Dirección	Dirección	TRW	18900	Terminal de dirección acero forjado con rótula de alta resistencia.	Terminal de dirección de acero forjado con rótula de alta resistencia y articulación sellada. Garantiza precisión y seguridad en la dirección del vehículo. Tratamiento anticorrosión. Cumple especificaciones del fabricante original.	[{"auto": "Renault Kangoo", "anios": "1997-2021"}, {"auto": "Renault Clio", "anios": "2005-2019"}, {"auto": "Renault Sandero", "anios": "2007-2020"}]		10	t	2026-05-28 17:48:30.180925-04	2026-05-28 17:48:30.180925-04	4	19
b29da158-c904-4cdf-afae-8c3a5539647c	0204-123	Perno Culata	Motor	Genérico	2101	Perno Culata	Perno Culata	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	1
52b27da0-b922-4535-b41f-4d43bc88288a	1109-AY	Filtro Aceite	Filtros y Lubricación	Genérico	4851	Filtro Aceite	Filtro Aceite	[{"auto": "Peugeot 208", "anios": "n/d"}, {"auto": "Citro\\u00ebn C3", "anios": "n/d"}, {"auto": "Citro\\u00ebn C4", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	25
dbd14da5-254d-46b5-955e-e940b20d7bb4	9736-41	Aceite Total 2LTS 75W80	Transmisión	Genérico	20168	Aceite Total 2LTS 75W80	Aceite Total 2LTS 75W80	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
0e5d1186-06e9-41e3-9593-b03f372b4f0d	0043-00	Aceite 75W90 1 Litro	Transmisión	Genérico	6723	Aceite 75W90 1 Litro	Aceite 75W90 1 Litro	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
51d46902-8540-449f-bcbf-c1e117176c81	1444-TV0	Fitro Aire Original	Filtros y Lubricación	Genérico	7383	Fitro Aire Original	Fitro Aire Original	[{"auto": "Peugeot 208 / 207 CC", "anios": "2010-2016"}, {"auto": "Citro\\u00ebn C-Elys\\u00e9e / Berlingo II", "anios": "2010-2016"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
384b6004-eee0-4e7a-8430-d49e8ba85dd0	1906-E60	Filtro Petroleo	Filtros y Lubricación	Genérico	5882	Filtro Petroleo	Filtro Petroleo	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	30
3ef7f9e4-e6fc-44ec-ab08-a0e77ff91060	1981-53	Oring.inyector chico	Combustible	Genérico	1260	Oring.inyector chico	Oring.inyector chico	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 1981.53 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	8	33
ca52a8a0-7e9b-4d91-ad41-92523220b9cb	3640-530	Rotula Suspension	Suspensión y Dirección	Genérico	5987	Rotula Suspension	Rotula Suspension	[{"auto": "Peugeot Partner", "anios": "n/d"}, {"auto": "Peugeot 307", "anios": "2001-2008"}, {"auto": "Peugeot 308", "anios": "2008-2013"}, {"auto": "Peugeot 508", "anios": "2010-2016"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	18
f77421e3-18fd-4661-a9de-b59389e0d551	450521	Abrazadera Metalica de Fuelles	Transmisión	Genérico	840	Abrazadera Metalica de Fuelles	Abrazadera Metalica de Fuelles	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	23
ecd524ad-e464-4314-93eb-53d2c6d23967	5038-85	Cazoleta Amortiguador	Suspensión y Dirección	Genérico	6723	Cazoleta Amortiguador	Cazoleta Amortiguador	[{"auto": "Peugeot Partner", "anios": "2007-2018 (motor 1.6)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
d2bdf89a-304c-4c0f-b9e2-7c93eb533904	AMG-001	Amortiguador Delantero	Suspensión	Monroe	45990	Amortiguador delantero hidráulico de doble acción, alta estabilidad y confort.	Amortiguador delantero hidráulico de doble acción con tecnología Safe-Tech. Diseñado para ofrecer estabilidad y confort en todo tipo de terreno. Fabricado con materiales de primera calidad, sello hermético para larga duración. Incluye tope de goma y guardapolvo. Garantía de 12 meses.	[{"auto": "Peugeot 206", "anios": "1998-2012"}, {"auto": "Peugeot 207", "anios": "2006-2015"}, {"auto": "Citro\\u00ebn C3", "anios": "2002-2016"}]		2	t	2026-05-28 17:48:30.180918-04	2026-06-04 20:44:06.787926-04	4	16
505b3694-7453-4dc0-8f43-ed8573d30ad1	CRR-007	Correa de Distribución	Motor	Gates	28700	Correa de distribución caucho HNBR reforzado con fibra de vidrio.	Correa de distribución fabricada en caucho HNBR con refuerzo de fibra de vidrio. Alta resistencia al desgaste, calor y aceites. Intervalo de cambio recomendado: 60.000 km o 4 años. Se recomienda cambiar junto con tensor y bomba de agua.	[{"auto": "Renault Duster", "anios": "2010-2023"}, {"auto": "Renault Fluence", "anios": "2009-2017"}, {"auto": "Renault Megane III", "anios": "2008-2016"}]		10	t	2026-05-28 17:48:30.180933-04	2026-05-28 17:48:30.180933-04	1	4
80b27927-c20b-48af-959f-1780d4478797	DSF-008	Disco de Freno Ventilado	Frenos	Brembo	38500	Disco de freno ventilado delantero, hierro fundido, alta disipación.	Disco de freno ventilado de hierro fundido gris de alta calidad. Diseño con aletas internas para óptima disipación del calor. Superficie rectificada de fábrica lista para instalar. Balanceado dinámicamente para evitar vibraciones.	[{"auto": "Chevrolet Cruze", "anios": "2009-2023"}, {"auto": "Chevrolet Tracker", "anios": "2013-2023"}, {"auto": "Chevrolet Onix", "anios": "2012-2023"}]		10	t	2026-05-28 17:48:30.180935-04	2026-05-28 17:48:30.180935-04	3	15
9c2adcd7-0747-4406-8143-d0dd4db5ee8f	FLT-005	Filtro de Aceite	Filtros y Aceites	Mann Filter	8900	Filtro de aceite motor alta eficiencia, celulosa y fibra sintética.	Filtro de aceite con medio filtrante de celulosa y fibra sintética de alta eficiencia. Retiene partículas hasta de 20 micrones. Válvula antirretorno integrada para protección en arranque en frío. Calidad OEM.	[{"auto": "DFM Minivan", "anios": "2010-2023"}, {"auto": "Renault Logan", "anios": "2004-2022"}, {"auto": "Renault Symbol", "anios": "2008-2018"}]		2	t	2026-05-28 17:48:30.180929-04	2026-05-28 20:14:35.759134-04	7	25
8be183aa-e689-491f-a0ed-ceac06db7d79	0205-570	Perno Culata Original	Motor	Genérico	2969	Perno Culata Original	Perno Culata Original	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	1
7734a9da-079f-4773-b4a2-92194c2295a1	0942-53	Taquie Motor	Motor	Genérico	2941	Taquie Motor	Taquie Motor	[{"auto": "Peugeot / Citro\\u00ebn (motor di\\u00e9sel 2.0 HDi)", "anios": "1999 en adelante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	1
e2e02ef0-4739-4ff8-b9a4-3cfe0afccca2	1444-TV	Filtro de Aire = 1611891580	Filtros y Lubricación	Genérico	3361	Filtro de Aire = 1611891580	Filtro de Aire = 1611891580	[{"auto": "Peugeot 308 / 3008 / 508", "anios": "Motor 1.6 HDi"}, {"auto": "Citro\\u00ebn Berlingo / C3 / C4 / C5", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
b054e989-dd62-4276-94f2-03fac0489b96	1610693780	Filtro Aceite Oring Cuadrado	Filtros y Lubricación	Genérico	5042	Filtro Aceite Oring Cuadrado	Filtro Aceite Oring Cuadrado	[{"auto": "Peugeot 208 / 301 / 308 / 508 / 2008 / 5008", "anios": "2012-"}, {"auto": "Citro\\u00ebn C3 / C4 / C-Elys\\u00e9e / Berlingo", "anios": "2012- (motores DV4/DV6 1.4-1.6D)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	25
450bec28-c8db-4bc4-9b08-e5454f9ebec4	0006-00A	Refrigerante 50/50 4 Litros Vistony	Refrigeración y Calefacción	Genérico	10033	Refrigerante 50/50 4 Litros Vistony	Refrigerante 50/50 4 Litros Vistony	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	28
e0380932-cd65-41b9-b44c-2ece386a319f	0005-00	Coolant Refrigerante Radiador	Refrigeración y Calefacción	Genérico	2521	Coolant Refrigerante Radiador	Coolant Refrigerante Radiador	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	28
f2c022a8-fcaf-457d-a9fe-917eb2af8efc	0086-00	Aceite 5W30 4 Litros	Filtros y Lubricación	Genérico	41154	Aceite 5W30 4 Litros	Aceite 5W30 4 Litros	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
469a3e2b-3b81-4203-9bcb-0e75a026f6e4	0052-00	Coolant Verde 10 Litros	Refrigeración y Calefacción	Genérico	4202	Coolant Verde 10 Litros	Coolant Verde 10 Litros	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	28
bf7bb3db-46d5-4de1-9450-c43d9b782e99	1906-E6	Filtro Petroleo	Filtros y Lubricación	Genérico	14286	Filtro Petroleo	Filtro Petroleo	[{"auto": "Citro\\u00ebn Berlingo", "anios": "2012-2019"}, {"auto": "Citro\\u00ebn C4", "anios": "2012-2019"}, {"auto": "Peugeot Partner", "anios": "2012-2019"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	30
15b9a67e-4cc1-4233-b582-78aaad0f6455	5035-19	Rodamiento Cazoleta	Suspensión y Dirección	Genérico	4202	Rodamiento Cazoleta	Rodamiento Cazoleta	[{"auto": "Peugeot Partner", "anios": "n/d"}, {"auto": "Peugeot 206 / 306 / 307", "anios": "n/d"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
943ad5b4-1463-46ab-a94b-cd87ade8078d	5087-50	Bieleta Barra Estabilizadora=9831547080	Suspensión y Dirección	Genérico	3922	Bieleta Barra Estabilizadora=9831547080	Bieleta Barra Estabilizadora=9831547080	[{"auto": "Peugeot 308 II", "anios": "2013-"}, {"auto": "Peugeot 3008 I", "anios": "2009-2016"}, {"auto": "Peugeot 5008", "anios": "2009-2017"}, {"auto": "Citro\\u00ebn C4 I / C4 II / C4 Grand Picasso I", "anios": "2004-2018"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	20
b385bf3e-d1d2-4db7-89cc-9d4fbbcc6641	0081-00B	Aceite 10w40 4 Litros Total	Filtros y Lubricación	Genérico	23529	Aceite 10w40 4 Litros Total	Aceite 10w40 4 Litros Total	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
b382c45b-c1b8-4cb4-932b-1cc0411487d9	0088-00	Aceite 5W30 1 Litro	Filtros y Lubricación	Genérico	10924	Aceite 5W30 1 Litro	Aceite 5W30 1 Litro	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
852f584d-ee1d-4b1a-92f5-af039733895d	0903-65	Balancin Admision/Esc-HDI	Motor	Genérico	5602	Balancin Admision/Esc-HDI	Balancin Admision/Esc-HDI	[{"auto": "Citro\\u00ebn Berlingo", "anios": "Motor 1.4/1.6 HDi"}, {"auto": "Citro\\u00ebn C3 / C4 / C5", "anios": "Motor 1.4/1.6 HDi"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	1
84d225a6-22b9-47b8-8982-9994616a7ae3	1109-X3	Filtro Aceite	Filtros y Lubricación	Genérico	3361	Filtro Aceite	Filtro Aceite	[{"auto": "Peugeot 206", "anios": "n/d"}, {"auto": "Peugeot 207", "anios": "n/d"}, {"auto": "Peugeot 307", "anios": "n/d"}, {"auto": "Citro\\u00ebn C4", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	25
887af5bc-dfd8-4ee5-882c-79071d2cc632	1323-V3	Acople Termostato	Refrigeración y Calefacción	Genérico	3361	Acople Termostato	Acople Termostato	[{"auto": "Peugeot 208 / 308 / 508 / 2008 / 3008 / 5008", "anios": "n/d"}, {"auto": "Citro\\u00ebn C3 / C4 / C5", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	27
76223659-ce58-4fa9-a4c8-a196aa9b29a2	1982-63	Tuerca Inyector	Combustible	Genérico	1681	Tuerca Inyector	Tuerca Inyector	[{"auto": "Peugeot 307 / 308 / 407", "anios": "n/d"}, {"auto": "Peugeot 206 / 207", "anios": "n/d"}, {"auto": "Peugeot 3008 / 5008 / Expert / Partner", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	8	33
5ff6c31a-c40e-41c4-945f-305820df4da1	1982-83	Perno Inyector	Combustible	Genérico	1260	Perno Inyector	Perno Inyector	[{"auto": "Peugeot 307 / 308 / 407", "anios": "n/d"}, {"auto": "Peugeot 206 / 207", "anios": "n/d"}, {"auto": "Peugeot 3008 / 5008 / Expert / Partner", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	8	33
b54fa3c2-0243-4f88-a0de-34ca05c9a8df	2454-F50	Varilla Palanca Cambio Corta	Transmisión	Genérico	6723	Varilla Palanca Cambio Corta	Varilla Palanca Cambio Corta	[{"auto": "Peugeot 206", "anios": "1998-2009"}, {"auto": "Peugeot 206+", "anios": "2009-"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	24
4fe67802-81c4-420b-9486-8653f68b9ed2	3287-A91	Fuelle Lado Caja Triceta S/Grasa	Transmisión	Genérico	4322	Fuelle Lado Caja Triceta S/Grasa	Fuelle Lado Caja Triceta S/Grasa	[{"auto": "Citro\\u00ebn Berlingo (B9)", "anios": "n/d"}, {"auto": "Citro\\u00ebn C3 Picasso", "anios": "n/d"}, {"auto": "Citro\\u00ebn C4 Picasso / Grand Picasso", "anios": "n/d"}, {"auto": "Citro\\u00ebn C5", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	23
109d92c2-e0f3-4db6-a185-ba25c917df23	3293-03	Fuelle Lado Rueda C/Grasa	Transmisión	Genérico	5882	Fuelle Lado Rueda C/Grasa	Fuelle Lado Rueda C/Grasa	[{"auto": "Citro\\u00ebn Berlingo / C5 / Xsara", "anios": "n/d"}, {"auto": "Peugeot 206 / 306 / 307 / 406 / Partner", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	23
40b0bf8c-21f9-46ed-9181-f8da9e876a9d	3817-09	Terminal Direccion	Suspensión y Dirección	Genérico	5882	Terminal Direccion	Terminal Direccion	[{"auto": "Peugeot Partner", "anios": "1996-"}, {"auto": "Peugeot 306", "anios": "1993-2000"}, {"auto": "Peugeot 307", "anios": "2001-2008"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	19
0f5ce0b0-9fe7-4073-9caa-406ccbe54f46	4246-W1	Disco Freno Delanteros	Frenos	Genérico	14706	Disco Freno Delanteros	Disco Freno Delanteros	[{"auto": "Peugeot (eje delantero, disco 266mm, 1.6)", "anios": "n/d"}, {"auto": "Citro\\u00ebn (eje delantero, disco 266mm, 1.6)", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	3	15
1509d38a-46b0-4f41-bec3-2191606d4ce7	4252-400	Juego Pastillas Freno Delanteras	Frenos	Genérico	12605	Juego Pastillas Freno Delanteras	Juego Pastillas Freno Delanteras	[{"auto": "Peugeot / Citro\\u00ebn", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	3	14
e6cb1abd-45da-4291-add7-97732ae32502	5208-70	Amortiguador Delantero Derecho	Suspensión y Dirección	Genérico	24981	Amortiguador Delantero Derecho	Amortiguador Delantero Derecho	[{"auto": "Peugeot 207", "anios": "2006-2015"}, {"auto": "Citro\\u00ebn C4 I", "anios": "2004-2010"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
34c07a64-8b94-4bdf-b4a4-fd758e68a5b0	5750-YQ	Correa 6PK975	Encendido y Eléctrico	Genérico	8403	Correa 6PK975	Correa 6PK975	[{"auto": "Citro\\u00ebn C3", "anios": "2002-2016"}, {"auto": "Citro\\u00ebn C4 / C4 Grand Picasso", "anios": "2004-2018"}, {"auto": "Peugeot 307", "anios": "2001-2008"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	8
a1ba4a6d-a06c-4318-a091-b2f44a61a2cb	0204-83	Perno Culata	Motor	Genérico	2521	Perno Culata	Perno Culata	[{"auto": "Peugeot 206", "anios": "1998-2012"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	1
f53f8545-35d7-43b2-bdc1-316800b7f513	0831-B90	Kit Distribucion + Bomba Agua	Motor	Genérico	88235	Kit Distribucion + Bomba Agua	Kit Distribucion + Bomba Agua	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	5
23e931fd-ae82-4e27-af17-3dff7ea1ed0e	1104-36	Juego Oring base F/Aceite	Filtros y Lubricación	Genérico	5135	Juego Oring base F/Aceite	Juego Oring base F/Aceite	[{"auto": "Peugeot 206", "anios": "2001-2009"}, {"auto": "Peugeot 207", "anios": "2007-"}, {"auto": "Peugeot 2008 / 3008 / 307", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	25
2120e7ff-3457-46dc-98f2-e98d654f96b0	1201-G11	Bomba AGUA	Refrigeración y Calefacción	Genérico	16807	Bomba AGUA	Bomba AGUA	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	28
eedacbf8-d945-4d3f-9a2a-af779c97275b	1306-J5	Tapa Deposito Agua	Refrigeración y Calefacción	Genérico	4977	Tapa Deposito Agua	Tapa Deposito Agua	[{"auto": "Peugeot 206 / 207 / 307", "anios": "n/d"}, {"auto": "Peugeot 407 / 607", "anios": "n/d"}, {"auto": "Citro\\u00ebn C2 / C5", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	28
2823efa9-6eae-4079-8ffa-8514aeec842a	1611277880	Kit Tensor + Correa Alternador 6PK976	Encendido y Eléctrico	Genérico	41083	Kit Tensor + Correa Alternador 6PK976	Kit Tensor + Correa Alternador 6PK976	[{"auto": "Peugeot 207 / 208 / 308 II / Partner", "anios": "n/d"}, {"auto": "Citro\\u00ebn Berlingo / C3 / C4", "anios": "correa 6PK976"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	8
9b058e12-2151-430e-8dc4-5dbb50aeb5ef	1624797780F	Filtro Aceite Original	Filtros y Lubricación	Genérico	9244	Filtro Aceite Original	Filtro Aceite Original	[{"auto": "Peugeot 208 I", "anios": "2018-2019"}, {"auto": "Peugeot 3008 SUV", "anios": "2016-2025"}, {"auto": "Citro\\u00ebn C3 / C4 Cactus", "anios": "2015-2025"}, {"auto": "Opel Corsa F / Crossland X", "anios": "2019-2025"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	25
f3c5f75d-59d3-4222-8ce1-08de0fd091a2	0013-00A	Silicona Gris	Carrocería	Genérico	7143	Silicona Gris	Silicona Gris	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
575f4aba-c9dc-4adc-aea5-c28e673c45d1	0044-00	Aceite 75W80 1 Litro	Transmisión	Genérico	6723	Aceite 75W80 1 Litro	Aceite 75W80 1 Litro	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
ce8b3fff-94cf-47dc-a00e-40fe7e20d887	0038-00	Agua Destilada Desmineralizada	Carrocería	Genérico	1681	Agua Destilada Desmineralizada	Agua Destilada Desmineralizada	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
d889d5f9-dae6-4abc-88a5-a243ab64fdba	0090-00	Liquido ATF Hidraulico 1 Litros	Filtros y Lubricación	Genérico	5882	Liquido ATF Hidraulico 1 Litros	Liquido ATF Hidraulico 1 Litros	[{"auto": "Uso universal / Multimarca", "anios": "Según especificación técnica del fabricante"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	31
5064587d-51e5-48cf-a48d-9c85c6648d08	0249-C6	Empaquetadura Tapa Valvulas	Motor	Genérico	6302	Empaquetadura Tapa Valvulas	Empaquetadura Tapa Valvulas	[{"auto": "Peugeot 206", "anios": "2000-2009"}, {"auto": "Peugeot 307", "anios": "2000-2012"}, {"auto": "Citro\\u00ebn C3", "anios": "2002-2010"}, {"auto": "Citro\\u00ebn C4", "anios": "2004-2011"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "2000-2011"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	3
b4ecd015-7b3d-4c8a-8930-ee18064a5ea6	1306-J55	Tapa Deposito Agua Original	Frenos	Genérico	5882	Tapa Deposito Agua Original	Tapa Deposito Agua Original	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	3	14
dc1699c3-b799-4962-a3a7-762b6d9b9dc0	1806-A66	Soporte Motor Central Original	Motor	Genérico	21008	Soporte Motor Central Original	Soporte Motor Central Original	[{"auto": "Peugeot 207", "anios": "2006-2019"}, {"auto": "Peugeot 208", "anios": "2012-2019"}, {"auto": "Peugeot 301 / Citro\\u00ebn C-Elys\\u00e9e", "anios": "2013-2023"}, {"auto": "Citro\\u00ebn C3 / C3 Picasso / DS3", "anios": "2009-2019"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	3
6075a700-9d74-4c7d-9392-0de92190959f	1807-46	Buje Soporte Motor Trasero 70 mm	Motor	Genérico	6723	Buje Soporte Motor Trasero 70 mm	Buje Soporte Motor Trasero 70 mm	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	3
f8ccfa82-3a2d-4de1-b3b7-6074b8bedcae	1807-560	Soporte Motor 65 mm Metalico	Motor	Genérico	9594	Soporte Motor 65 mm Metalico	Soporte Motor 65 mm Metalico	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 1807.56 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	3
47bb85f8-d548-4157-b1f8-53ddffa0bc82	1844-47	Soporte Motor Derecho	Motor	Genérico	7563	Soporte Motor Derecho	Soporte Motor Derecho	[{"auto": "Peugeot Partner", "anios": "1996-2015"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "1996-2011"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	3
b8048a82-c7f8-4f53-9698-8d1ca2d57ec7	2105-35	Guia rodamiento Empuje	Transmisión	Genérico	14118	Guia rodamiento Empuje	Guia rodamiento Empuje	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 2105.35 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	21
e17fda95-54ba-45c5-a10c-7c5a85008134	2117-660	Horquilla-Embrague	Transmisión	Genérico	10504	Horquilla-Embrague	Horquilla-Embrague	[{"auto": "Citro\\u00ebn C3 / C4", "anios": "n/d"}, {"auto": "Peugeot 207 (1.6 HDi)", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	21
714c1c93-e27a-45a9-aed9-53cd9d6869a6	3121-266	Reten Lateral Derecho Caja Cambio	Transmisión	Genérico	6723	Reten Lateral Derecho Caja Cambio	Reten Lateral Derecho Caja Cambio	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 3121.26 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	22
08e007f5-0350-4f46-9379-c1a5f5e98b68	3121-277	Reten Lateral Izquierdo Caja Cambio	Transmisión	Genérico	6723	Reten Lateral Izquierdo Caja Cambio	Reten Lateral Izquierdo Caja Cambio	[{"auto": "Peugeot 206 / 207 / 307", "anios": "n/d"}, {"auto": "Citro\\u00ebn C3", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	5	22
7625330e-f566-43e5-9a43-9c54d977595a	5408-09	Cubre Perno Rueda	Carrocería	Genérico	1260	Cubre Perno Rueda	Cubre Perno Rueda	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	10	40
3f9ea9c0-25b2-4dbe-a1c7-5c0aa1b0c5c6	3350-690	Rodamiento Rueda Delantera c/Abs 42x82x36	Suspensión y Dirección	Genérico	15126	Rodamiento Rueda Delantera c/Abs 42x82x36	Rodamiento Rueda Delantera c/Abs 42x82x36	[{"auto": "Citro\\u00ebn Berlingo", "anios": "2008-2011"}, {"auto": "Citro\\u00ebn C3", "anios": "2002-2011"}, {"auto": "Citro\\u00ebn C4", "anios": "2004-2011"}, {"auto": "Peugeot 307 / 308", "anios": "2000-2011"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	18
2af448eb-9cbc-4cb8-82c5-d66581d4abb7	3520-K8	Bandeja de Suspension Izquierda	Suspensión y Dirección	Genérico	24650	Bandeja de Suspension Izquierda	Bandeja de Suspension Izquierda	[{"auto": "Citro\\u00ebn Berlingo", "anios": "1996-2018"}, {"auto": "Peugeot Partner", "anios": "1996-2018"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	20
ce1388cd-edfc-41f1-afbf-89347355d397	3521-G8	Bandeja Suspension Derecha	Suspensión y Dirección	Genérico	24693	Bandeja Suspension Derecha	Bandeja Suspension Derecha	[{"auto": "Peugeot Partner", "anios": "2008-2018"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "2008-2018"}, {"auto": "Citro\\u00ebn C4", "anios": "2008-2013"}, {"auto": "Peugeot 307", "anios": "2000-2009"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	20
1c2ad935-790f-4af7-a9e3-dfdf38173988	3640-77	Rotula Suspension	Suspensión y Dirección	Genérico	10084	Rotula Suspension	Rotula Suspension	[{"auto": "Citro\\u00ebn C3", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	18
5da2d074-1e59-4b5d-add4-5323824a2463	3748-A10	Rodamiento Rueda Trasera 25x52x42	Suspensión y Dirección	Genérico	13165	Rodamiento Rueda Trasera 25x52x42	Rodamiento Rueda Trasera 25x52x42	[{"auto": "Peugeot 301", "anios": "n/d"}, {"auto": "Citro\\u00ebn C-Elys\\u00e9e", "anios": "n/d"}, {"auto": "Peugeot 208", "anios": "n/d"}, {"auto": "Citro\\u00ebn C3 Picasso", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	18
ac46ea7b-6fd9-40bf-8a58-3d12c2d7b590	4066-73	Fuelle Cremallera Direccion	Suspensión y Dirección	Genérico	4202	Fuelle Cremallera Direccion	Fuelle Cremallera Direccion	[{"auto": "Peugeot 308", "anios": "n/d"}, {"auto": "Peugeot 408", "anios": "n/d"}, {"auto": "Citro\\u00ebn C4", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	18
3709731b-e176-4b8e-844c-3e0d7b5be94a	4254-250	Juego Pastilla Freno Delanteras	Frenos	Genérico	19664	Juego Pastilla Freno Delanteras	Juego Pastilla Freno Delanteras	[{"auto": "Citro\\u00ebn / Peugeot (sistema de frenos ATE-Teves, eje delantero)", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	3	14
a1330980-eda9-4c2a-b606-fceb8f81b0f6	5031-F2	Kit Cazoleta Amortiguador + Rodamiento y Copela	Suspensión y Dirección	Genérico	23529	Kit Cazoleta Amortiguador + Rodamiento y Copela	Kit Cazoleta Amortiguador + Rodamiento y Copela	[{"auto": "Peugeot 301", "anios": "2013-"}, {"auto": "Peugeot 208 / 2008", "anios": "2012-2019"}, {"auto": "Citro\\u00ebn C-Elys\\u00e9e", "anios": "2013-"}, {"auto": "Citro\\u00ebn C3", "anios": "2016-2022"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
93a79b6e-85a2-4cfb-9ebe-bfa0ef91b804	5038-77	Cazoleta Amortiguador	Suspensión y Dirección	Genérico	7563	Cazoleta Amortiguador	Cazoleta Amortiguador	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
0256ad20-1073-4190-95c4-c3a03a5b2082	5038-855	Cazoleta Amortiguador	Suspensión y Dirección	Genérico	14146	Cazoleta Amortiguador	Cazoleta Amortiguador	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
7143b4da-e947-4831-ae5a-34b35164443c	5087-39	Bieleta B/Estabilizadora	Suspensión y Dirección	Genérico	4202	Bieleta B/Estabilizadora	Bieleta B/Estabilizadora	[{"auto": "Citro\\u00ebn Xsara", "anios": "1997-2005"}, {"auto": "Citro\\u00ebn Xsara Picasso", "anios": "1999-2011"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "1995-2010"}, {"auto": "Peugeot 306 / Partner", "anios": "1993-2010"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	20
ae31f0a0-ce05-46ca-88f8-6e20ff3d6f77	5087-450	Bieleta Barra Estabilizadora	Suspensión y Dirección	Genérico	4202	Bieleta Barra Estabilizadora	Bieleta Barra Estabilizadora	[{"auto": "Citro\\u00ebn C2 / C3 / C4 Cactus", "anios": "n/d"}, {"auto": "Peugeot 206 / 1007 / 2008", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	20
e8347ca8-6ad8-49b5-8584-83c4788ac7c4	5087-54	Bieleta Barra Izquierda	Suspensión y Dirección	Genérico	5789	Bieleta Barra Izquierda	Bieleta Barra Izquierda	[{"auto": "Peugeot 207", "anios": "2006-2015"}, {"auto": "Citro\\u00ebn C3 Picasso", "anios": "2008-2015"}, {"auto": "Citro\\u00ebn C3 / DS3", "anios": "2009-2019"}, {"auto": "Peugeot 208 / 2008 / 301", "anios": "2012-2024"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	20
15c15abf-de64-4743-b05f-63d663649ebb	5203-206	Amortiguador Delantero Derecho	Suspensión y Dirección	Genérico	21008	Amortiguador Delantero Derecho	Amortiguador Delantero Derecho	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
01b3388e-fa98-4f8f-b6f4-93074c067d54	5208-69	Amortiguador Delantero Izquierdo	Suspensión y Dirección	Genérico	24958	Amortiguador Delantero Izquierdo	Amortiguador Delantero Izquierdo	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	4	16
dff1b76b-132f-45db-926a-ce7aef4c5d7f	5750-G2	Correa 6PK1564	Encendido y Eléctrico	Genérico	12605	Correa 6PK1564	Correa 6PK1564	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	8
1d37eb53-5a21-4e72-a855-4f179ba0d387	5751-730	Rodillo Correa Alternador	Encendido y Eléctrico	Genérico	5042	Rodillo Correa Alternador	Rodillo Correa Alternador	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	8
d072ccbc-01bb-4cad-badf-682ac8f851e4	5960-A5	Bujias Encendido	Encendido y Eléctrico	Genérico	5882	Bujias Encendido	Bujias Encendido	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 5960.A5 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
84253897-e952-42dd-aa2c-d15ac998cd9e	5960-E6	Bujias Incandecente	Encendido y Eléctrico	Genérico	4832	Bujias Incandecente	Bujias Incandecente	[{"auto": "Citro\\u00ebn C4", "anios": "2012-2017"}, {"auto": "Peugeot 308", "anios": "2007-2015"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
f3245ead-fa39-4f90-b0d2-c0bfb69704bc	5961-21	Bujias Encendido	Encendido y Eléctrico	Genérico	2504	Bujias Encendido	Bujias Encendido	[{"auto": "Peugeot 206 / 306 / 405", "anios": "1993-2012"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
85e2656a-37f3-4bc2-a572-c95df7180de2	5961-27	Bujias Encendido	Encendido y Eléctrico	Genérico	2941	Bujias Encendido	Bujias Encendido	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 5961.27 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
54a6b935-8276-4549-a8c8-e354184b90ae	5961-35	Bujias Encendido	Encendido y Eléctrico	Genérico	4202	Bujias Encendido	Bujias Encendido	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 5961.35 (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
993de791-30da-4163-8075-7681208c0ee5	5962-2Y	Bujia Incandecente	Encendido y Eléctrico	Genérico	4202	Bujia Incandecente	Bujia Incandecente	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 5962.2Y (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
96e459d4-86d4-49d0-a453-93f7075b5d17	5962-7X	Bujias Encendido	Encendido y Eléctrico	Genérico	3151	Bujias Encendido	Bujias Encendido	[{"auto": "Aplicaci\\u00f3n espec\\u00edfica no confirmada", "anios": "Referencia OE 5962.7X (Citro\\u00ebn/Peugeot)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	12
f197d12d-0d79-4377-8d5d-dc658e4280b8	5970-800	Bobina Encendido	Encendido y Eléctrico	Genérico	29412	Bobina Encendido	Bobina Encendido	[{"auto": "Citro\\u00ebn Berlingo / C3 / C4 / Saxo / Xsara / Xsara Picasso", "anios": "1999-2012 (motor 1.6)"}, {"auto": "Peugeot 1007 / 206 / Partner", "anios": "2000-2012 (motor 1.6)"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	7
e70e4cf2-9ec8-4254-ae42-7969f91c6a85	6216-97	Ampolleta H7	Iluminación	Genérico	2521	Ampolleta H7	Ampolleta H7	[{"auto": "Citro\\u00ebn (varios modelos)", "anios": "n/d"}, {"auto": "Peugeot (varios modelos)", "anios": "n/d"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	9	35
b7348545-6cec-4c2a-9169-7518401d1f6b	6325-G3	Farol Lateral Tapabarro	Iluminación	Genérico	5042	Farol Lateral Tapabarro	Farol Lateral Tapabarro	[{"auto": "Citro\\u00ebn Berlingo", "anios": "2006-2018"}, {"auto": "Peugeot Expert", "anios": "2007-2016"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	9	35
f7e3f167-4d41-4c76-b055-aa3f976a8300	6340-A3	Farol Patente	Iluminación	Genérico	4202	Farol Patente	Farol Patente	[{"auto": "Citro\\u00ebn C3", "anios": "2002-2016"}, {"auto": "Citro\\u00ebn C4 Picasso", "anios": "2006-2013"}, {"auto": "Citro\\u00ebn Berlingo", "anios": "1996-2018"}, {"auto": "Peugeot 206 / 307 / 407", "anios": "1998-2012"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	9	36
dfcb1b73-c051-415e-862e-9adfc124a97c	6372-102	Ampolleta Amarilla P/DISP	Iluminación	Genérico	840	Ampolleta Amarilla P/DISP	Ampolleta Amarilla P/DISP	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	9	36
69679ac1-2baf-4d96-a7dc-7c3d8891a9d2	6372-110	Ampolleta Globo chico 10w 67	Iluminación	Genérico	252	Ampolleta Globo chico 10w 67	Ampolleta Globo chico 10w 67	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	9	37
9c0aad7b-a7b6-4bf0-a7ed-d1459daaf525	6426-F1	Plumilla 26-Derecha	Carrocería	Genérico	5042	Plumilla 26-Derecha	Plumilla 26-Derecha	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	10	40
80b4f30d-ebf0-4218-86eb-61cf1edd7507	6430-620	Plumilla 16 Pulgadas	Carrocería	Genérico	5042	Plumilla 16 Pulgadas	Plumilla 16 Pulgadas	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	10	40
c9d76575-db46-4244-8d69-b6ea35b4862a	6447-XF	Filtro Polen	Filtros y Lubricación	Genérico	4202	Filtro Polen	Filtro Polen	[{"auto": "Citro\\u00ebn Berlingo III", "anios": "2008-"}, {"auto": "Citro\\u00ebn C4 Picasso", "anios": "2006-"}, {"auto": "Peugeot 3008 / 5008 / Partner III", "anios": "2008-"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
cf50cda5-09ab-49a6-bbb3-3012bc656b90	6447-XFF	Filtro Polen	Filtros y Lubricación	Genérico	6723	Filtro Polen	Filtro Polen	[{"auto": "Citro\\u00ebn Berlingo III / C4 Grand Picasso", "anios": "2008-"}, {"auto": "Peugeot 3008 / 5008 / Partner III", "anios": "2008-"}, {"auto": "Citro\\u00ebn DS5", "anios": "2011-2015"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
261a164b-658f-433f-825b-796131418446	9813908880F	Filtro Aire Original	Filtros y Lubricación	Genérico	10084	Filtro Aire Original	Filtro Aire Original	[{"auto": "Citro\\u00ebn Berlingo III / C3 Aircross / C3 III / C-Elys\\u00e9e", "anios": "2014-"}, {"auto": "Peugeot 2008 / 3008 / Partner / Expert", "anios": "2013-"}, {"auto": "Opel Combo", "anios": "2018-"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
34dc9401-40a3-46b0-8412-7a927e092f28	R0727-	Bomba de Agua	Refrigeración y Calefacción	Genérico	17647	Bomba de Agua	Bomba de Agua	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	6	28
4a96a6c1-bd43-4bc8-919a-fcdf726c7934	R0768-	Bobina Encendido	Encendido y Eléctrico	Genérico	7983	Bobina Encendido	Bobina Encendido	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	2	7
5910e03c-a27b-4b53-941d-6c08efea3f0e	R2659-	Filtro Polen	Filtros y Lubricación	Genérico	4202	Filtro Polen	Filtro Polen	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
4cd630ed-4f83-4b85-bcbb-71ec2926bcf6	R2685-	Filtro de Aire	Filtros y Lubricación	Genérico	3484	Filtro de Aire	Filtro de Aire	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	7	29
ff89b4c0-f5ee-4095-a4fe-48239dee6c8d	R6572-	Perno Culata	Motor	Genérico	2101	Perno Culata	Perno Culata	[{"auto": "Compatibilidad no confirmada", "anios": "Consultar disponibilidad en tienda"}]		10	t	2026-07-01 21:52:03.249691-04	2026-07-01 21:52:03.249691-04	1	1
\.


--
-- Data for Name: subfamilias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subfamilias (id, nombre, familia_id) FROM stdin;
1	Culata	1
2	Cigüeñal	1
3	Retenes	1
4	Distribución	1
5	Kit Distribución	1
6	Turbo	1
7	Encendido	2
8	Alternador	2
9	Motor Partida	2
10	Distribuidor	2
11	Sensores	2
12	Bujías	2
13	Cables de Bujías	2
14	Pastillas de Freno	3
15	Discos de Freno	3
16	Amortiguadores	4
17	Resortes	4
18	Bujes y Rótulas	4
19	Terminales de Dirección	4
20	Brazos de Suspensión	4
21	Embrague	5
22	Semiejes	5
23	Juntas Homocinéticas	5
24	Caja de Cambios	5
25	Filtros de Aceite	7
26	Radiadores de Calefacción	6
27	Termostatos	6
28	Mangueras	6
29	Filtros de Aire	7
30	Filtros de Combustible	7
31	Aceites de Motor	7
32	Bomba de Combustible	8
33	Inyectores	8
34	Carburadores	8
35	Faros Delanteros	9
36	Luces Traseras	9
37	Luces Interiores	9
38	Paragolpes	10
39	Espejos	10
40	Manillas y Cerraduras	10
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, username, hashed_password, activo, creado_en, rol) FROM stdin;
0b6acb23-9f20-403c-bd81-bd5e053bd480	admin	$2b$12$bCfCaCq4Gtot3TaPmIHQcevlIbZahfNGxrlf8FMr144BRKSFSPke.	t	2026-05-28 17:48:30.172924-04	admin
\.


--
-- Name: familias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.familias_id_seq', 10, true);


--
-- Name: marcas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.marcas_id_seq', 10, true);


--
-- Name: modelos_auto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.modelos_auto_id_seq', 26, true);


--
-- Name: motores_auto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.motores_auto_id_seq', 49, true);


--
-- Name: producto_compatibilidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_compatibilidades_id_seq', 1, false);


--
-- Name: subfamilias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subfamilias_id_seq', 62, true);


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


