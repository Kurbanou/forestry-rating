--
-- PostgreSQL database dump
--

\restrict oxmKQzM7pC0anLX76rSgCFZhpd7fe1NqebuwNcVwLOtOBQSf6dpSEeS6Qz0Zqhk

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: forestries; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.forestries (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.forestries OWNER TO admin;

--
-- Name: forestries_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.forestries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forestries_id_seq OWNER TO admin;

--
-- Name: forestries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.forestries_id_seq OWNED BY public.forestries.id;


--
-- Name: indicator_responsible; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.indicator_responsible (
    id integer NOT NULL,
    indicator_id integer,
    user_id integer,
    assigned_by integer,
    assigned_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.indicator_responsible OWNER TO admin;

--
-- Name: indicator_responsible_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.indicator_responsible_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.indicator_responsible_id_seq OWNER TO admin;

--
-- Name: indicator_responsible_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.indicator_responsible_id_seq OWNED BY public.indicator_responsible.id;


--
-- Name: indicators; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.indicators (
    id integer NOT NULL,
    section_id integer,
    name text NOT NULL,
    max_weight integer NOT NULL,
    unit text DEFAULT 'га'::text,
    description text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    type text DEFAULT 'positive'::text,
    CONSTRAINT indicators_type_check CHECK ((type = ANY (ARRAY['positive'::text, 'penalty'::text, 'bonus'::text])))
);


ALTER TABLE public.indicators OWNER TO admin;

--
-- Name: indicators_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.indicators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.indicators_id_seq OWNER TO admin;

--
-- Name: indicators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.indicators_id_seq OWNED BY public.indicators.id;


--
-- Name: raw_data; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.raw_data (
    id integer NOT NULL,
    forestry_id integer,
    indicator_id integer,
    value numeric(10,2) DEFAULT 0 NOT NULL,
    period date DEFAULT CURRENT_DATE NOT NULL,
    created_by integer,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.raw_data OWNER TO admin;

--
-- Name: raw_data_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.raw_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.raw_data_id_seq OWNER TO admin;

--
-- Name: raw_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.raw_data_id_seq OWNED BY public.raw_data.id;


--
-- Name: sections; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.sections (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    sort_order integer DEFAULT 0
);


ALTER TABLE public.sections OWNER TO admin;

--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sections_id_seq OWNER TO admin;

--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'viewer'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'engineer'::text, 'viewer'::text])))
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: forestries id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.forestries ALTER COLUMN id SET DEFAULT nextval('public.forestries_id_seq'::regclass);


--
-- Name: indicator_responsible id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicator_responsible ALTER COLUMN id SET DEFAULT nextval('public.indicator_responsible_id_seq'::regclass);


--
-- Name: indicators id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicators ALTER COLUMN id SET DEFAULT nextval('public.indicators_id_seq'::regclass);


--
-- Name: raw_data id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.raw_data ALTER COLUMN id SET DEFAULT nextval('public.raw_data_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: forestries; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.forestries (id, name, created_at) FROM stdin;
7	Берштовское лесничество	2026-02-27 07:31:44.368511+00
8	Лунненское лесничество	2026-02-27 07:32:11.397726+00
9	Новорудское лесничество	2026-02-27 07:32:18.161592+00
10	Озерское лесничество	2026-02-27 07:32:27.328385+00
11	Поречское лесничество	2026-02-27 07:32:36.130714+00
12	Скидельское лесничество	2026-02-27 07:32:44.257676+00
\.


--
-- Data for Name: indicator_responsible; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.indicator_responsible (id, indicator_id, user_id, assigned_by, assigned_at) FROM stdin;
5	9	4	1	2026-02-27 09:08:37.258608+00
\.


--
-- Data for Name: indicators; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.indicators (id, section_id, name, max_weight, unit, description, created_by, created_at, is_active, type) FROM stdin;
9	5	Рубки ухода в молодняках	80	га	Учитывается объемы осветление и прочистки, согласно данным 1С	1	2026-02-27 07:41:32.371686+00	t	positive
10	5	Рубки прореживания	80	га		1	2026-02-27 09:02:59.258302+00	t	positive
11	5	Рубки прореживания	80	куб.м		1	2026-02-27 09:17:00.386152+00	t	positive
12	5	Проходные рубки	80	га		1	2026-02-27 09:17:37.540098+00	t	positive
\.


--
-- Data for Name: raw_data; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.raw_data (id, forestry_id, indicator_id, value, period, created_by, updated_at) FROM stdin;
34	8	9	6.00	2026-02-01	1	2026-02-27 07:43:06.271269+00
35	9	9	5.00	2026-02-01	1	2026-02-27 07:43:08.173953+00
36	10	9	3.00	2026-02-01	1	2026-02-27 07:43:10.530024+00
37	11	9	10.00	2026-02-01	1	2026-02-27 07:43:12.847351+00
38	12	9	5.00	2026-02-01	1	2026-02-27 07:43:14.687401+00
39	7	9	3.00	2026-01-01	1	2026-02-27 07:43:29.657828+00
40	8	9	4.00	2026-01-01	1	2026-02-27 07:43:31.38972+00
41	9	9	5.00	2026-01-01	1	2026-02-27 07:43:33.167675+00
42	10	9	2.00	2026-01-01	1	2026-02-27 07:43:34.745531+00
43	11	9	5.00	2026-01-01	1	2026-02-27 07:43:36.344545+00
44	12	9	1.00	2026-01-01	1	2026-02-27 07:43:38.223041+00
33	7	9	50.00	2026-02-01	1	2026-02-27 07:45:46.527072+00
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sections (id, name, description, created_by, created_at, sort_order) FROM stdin;
5	Лесохозяйственный блок		1	2026-02-27 07:41:00.836181+00	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password, role, created_at) FROM stdin;
5	lesovost@skidles.by	$2b$10$VtJhv0/XG9w4X8y/P6fvjOcx9E06yZJsnN.BbHqvS931WRMhwmeY2	engineer	2026-02-27 07:33:47.380207+00
6	lesopatolog@skidles.by	$2b$10$Oi7t97kZjTh8KHaLgB3NgeyN2yLIPhTo/vIxfysgMZJpm2ZZQJ2pK	engineer	2026-02-27 07:34:39.047211+00
7	ohranalesa@skidles.by	$2b$10$PmcXWZ7hlZ1Hpqk5VQqrgOCS2o6.tGzbkrzweRJQAtxKWfKUhZ9g.	engineer	2026-02-27 07:35:26.025578+00
8	zagotovka@skidles.by	$2b$10$Bbc6BikyWvVBJ8Ewuj.z3eQ2cDXR7/Noy/yL4fz1TWHye3EjRZWJO	engineer	2026-02-27 07:36:00.853566+00
9	engineer@skidles.by	$2b$10$cISWgRYJmCxyfuWhZdsDielzi58dhSpG.SNT3fwBVhKLvn9Aa8.9q	engineer	2026-02-27 07:36:59.120432+00
10	ideolog@skidles.by	$2b$10$vBDQw0E2d2GaM6qEfxw69OBbvqMMeP3swtPY3gME0VkgFh5YZ8LpW	engineer	2026-02-27 07:37:25.666296+00
11	kadry@skidles.by	$2b$10$LKsjk91jaasiSNPm2BOhW.uuReTedTFRzOliJ0Q.RwfP9t6cJ.Pua	engineer	2026-02-27 07:37:55.805914+00
12	lesnichy@skidles.by	$2b$10$yp2QNS0o/JYtTqhk6quAbOj/MNOgjSPh2nzZALIGm.i4Nand0xvDO	engineer	2026-02-27 07:38:33.225016+00
1	admin@skidles.by	$2b$10$tvEc.yE1AZrSpXbGZuqnf.7RcvSLPfevbhgcvSsoOEN4a8w1KfLpq	admin	2026-02-26 12:36:38.555969+00
4	nach@skidles.by	$2b$10$TWHt8X9H2faSdqqNNWOYcOeczOldXf35WSkZowuEtViMjWdYzUmrq	engineer	2026-02-27 07:09:47.223799+00
\.


--
-- Name: forestries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.forestries_id_seq', 12, true);


--
-- Name: indicator_responsible_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.indicator_responsible_id_seq', 5, true);


--
-- Name: indicators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.indicators_id_seq', 12, true);


--
-- Name: raw_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.raw_data_id_seq', 44, true);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.sections_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: forestries forestries_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.forestries
    ADD CONSTRAINT forestries_pkey PRIMARY KEY (id);


--
-- Name: indicator_responsible indicator_responsible_indicator_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicator_responsible
    ADD CONSTRAINT indicator_responsible_indicator_id_user_id_key UNIQUE (indicator_id, user_id);


--
-- Name: indicator_responsible indicator_responsible_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicator_responsible
    ADD CONSTRAINT indicator_responsible_pkey PRIMARY KEY (id);


--
-- Name: indicators indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicators
    ADD CONSTRAINT indicators_pkey PRIMARY KEY (id);


--
-- Name: raw_data raw_data_forestry_id_indicator_id_period_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.raw_data
    ADD CONSTRAINT raw_data_forestry_id_indicator_id_period_key UNIQUE (forestry_id, indicator_id, period);


--
-- Name: raw_data raw_data_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.raw_data
    ADD CONSTRAINT raw_data_pkey PRIMARY KEY (id);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_indicator_responsible_indicator; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_indicator_responsible_indicator ON public.indicator_responsible USING btree (indicator_id);


--
-- Name: idx_indicator_responsible_user; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_indicator_responsible_user ON public.indicator_responsible USING btree (user_id);


--
-- Name: idx_indicators_section; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_indicators_section ON public.indicators USING btree (section_id);


--
-- Name: idx_raw_data_indicator; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_raw_data_indicator ON public.raw_data USING btree (indicator_id);


--
-- Name: idx_raw_data_period; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_raw_data_period ON public.raw_data USING btree (period);


--
-- Name: indicator_responsible indicator_responsible_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicator_responsible
    ADD CONSTRAINT indicator_responsible_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: indicator_responsible indicator_responsible_indicator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicator_responsible
    ADD CONSTRAINT indicator_responsible_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES public.indicators(id) ON DELETE CASCADE;


--
-- Name: indicator_responsible indicator_responsible_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicator_responsible
    ADD CONSTRAINT indicator_responsible_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: indicators indicators_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicators
    ADD CONSTRAINT indicators_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: indicators indicators_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.indicators
    ADD CONSTRAINT indicators_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: raw_data raw_data_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.raw_data
    ADD CONSTRAINT raw_data_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: raw_data raw_data_forestry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.raw_data
    ADD CONSTRAINT raw_data_forestry_id_fkey FOREIGN KEY (forestry_id) REFERENCES public.forestries(id) ON DELETE CASCADE;


--
-- Name: raw_data raw_data_indicator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.raw_data
    ADD CONSTRAINT raw_data_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES public.indicators(id) ON DELETE CASCADE;


--
-- Name: sections sections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict oxmKQzM7pC0anLX76rSgCFZhpd7fe1NqebuwNcVwLOtOBQSf6dpSEeS6Qz0Zqhk

