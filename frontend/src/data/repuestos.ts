import amortiguadorImg from "@/assets/products/amortiguador.png";
import radiadorImg from "@/assets/products/radiador-calefaccion.png";
import terminalImg from "@/assets/products/terminal-direccion.png";
import pastillasImg from "@/assets/products/pastillas-freno.png";
import filtroImg from "@/assets/products/filtro-aceite.png";
import bobinaImg from "@/assets/products/bobina-encendido.png";
import correaImg from "@/assets/products/correa-distribucion.png";
import discoImg from "@/assets/products/disco-freno.png";

export interface Repuesto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  descripcion: string;
  detalle: string;
  compatibilidad: { auto: string; anios: string }[];
  imagen: string;
  enStock: boolean;
}

export const categorias = [
  "Todos",
  "Frenos",
  "Motor",
  "Suspensión",
  "Dirección",
  "Filtros y Aceites",
  "Calefacción",
  "Eléctrico",
] as const;

export const repuestos: Repuesto[] = [
  {
    id: "1",
    codigo: "AMG-001",
    nombre: "Amortiguador Delantero",
    categoria: "Suspensión",
    marca: "Monroe",
    precio: 45990,
    descripcion: "Amortiguador delantero hidráulico de doble acción, alta estabilidad y confort.",
    detalle: "Amortiguador delantero hidráulico de doble acción con tecnología Safe-Tech. Diseñado para ofrecer estabilidad y confort en todo tipo de terreno. Fabricado con materiales de primera calidad, sello hermético para larga duración. Incluye tope de goma y guardapolvo. Garantía de 12 meses.",
    compatibilidad: [
      { auto: "Peugeot 206", anios: "1998-2012" },
      { auto: "Peugeot 207", anios: "2006-2015" },
      { auto: "Citroën C3", anios: "2002-2016" },
    ],
    imagen: amortiguadorImg,
    enStock: true,
  },
  {
    id: "2",
    codigo: "RAD-002",
    nombre: "Radiador de Calefacción",
    categoria: "Calefacción",
    marca: "Valeo",
    precio: 32500,
    descripcion: "Radiador de calefacción interior aluminio/cobre, calefacción eficiente.",
    detalle: "Radiador de calefacción fabricado en aluminio y cobre de alta conductividad térmica. Proporciona calefacción eficiente para el habitáculo del vehículo. Fácil instalación, sellado hermético y alta durabilidad. Certificación OEM.",
    compatibilidad: [
      { auto: "Peugeot 308", anios: "2007-2021" },
      { auto: "Peugeot 408", anios: "2010-2022" },
      { auto: "Citroën C4", anios: "2004-2020" },
    ],
    imagen: radiadorImg,
    enStock: true,
  },
  {
    id: "3",
    codigo: "TDD-003",
    nombre: "Terminal de Dirección",
    categoria: "Dirección",
    marca: "TRW",
    precio: 18900,
    descripcion: "Terminal de dirección acero forjado con rótula de alta resistencia.",
    detalle: "Terminal de dirección de acero forjado con rótula de alta resistencia y articulación sellada. Garantiza precisión y seguridad en la dirección del vehículo. Tratamiento anticorrosión. Cumple especificaciones del fabricante original.",
    compatibilidad: [
      { auto: "Renault Kangoo", anios: "1997-2021" },
      { auto: "Renault Clio", anios: "2005-2019" },
      { auto: "Renault Sandero", anios: "2007-2020" },
    ],
    imagen: terminalImg,
    enStock: true,
  },
  {
    id: "4",
    codigo: "PFR-004",
    nombre: "Pastillas de Freno Delanteras",
    categoria: "Frenos",
    marca: "Ferodo",
    precio: 22500,
    descripcion: "Juego de pastillas semimetálicas de alto rendimiento, bajo ruido.",
    detalle: "Pastillas de freno semimetálicas de alto rendimiento. Excelente frenado en seco y mojado. Baja generación de polvo y ruido. Cumple normas ECE R90. Incluye 4 pastillas por juego con indicador de desgaste.",
    compatibilidad: [
      { auto: "Chevrolet Corsa", anios: "1994-2012" },
      { auto: "Chevrolet Agile", anios: "2009-2014" },
      { auto: "Chevrolet Prisma", anios: "2012-2020" },
    ],
    imagen: pastillasImg,
    enStock: true,
  },
  {
    id: "5",
    codigo: "FLT-005",
    nombre: "Filtro de Aceite",
    categoria: "Filtros y Aceites",
    marca: "Mann Filter",
    precio: 8900,
    descripcion: "Filtro de aceite motor alta eficiencia, celulosa y fibra sintética.",
    detalle: "Filtro de aceite con medio filtrante de celulosa y fibra sintética de alta eficiencia. Retiene partículas hasta de 20 micrones. Válvula antirretorno integrada para protección en arranque en frío. Calidad OEM.",
    compatibilidad: [
      { auto: "DFM Minivan", anios: "2010-2023" },
      { auto: "Renault Logan", anios: "2004-2022" },
      { auto: "Renault Symbol", anios: "2008-2018" },
    ],
    imagen: filtroImg,
    enStock: false,
  },
  {
    id: "6",
    codigo: "BBA-006",
    nombre: "Bobina de Encendido",
    categoria: "Eléctrico",
    marca: "Bosch",
    precio: 35000,
    descripcion: "Bobina de encendido electrónica alto voltaje para sistemas de inyección.",
    detalle: "Bobina de encendido de alto voltaje con núcleo ferromagnético de alta permeabilidad. Compatible con sistemas de encendido electrónico e inyección directa. Resistente a vibraciones y temperaturas extremas. Conector original incluido.",
    compatibilidad: [
      { auto: "Peugeot 208", anios: "2012-2023" },
      { auto: "Citroën C3 Aircross", anios: "2017-2023" },
      { auto: "Citroën Berlingo", anios: "2008-2021" },
    ],
    imagen: bobinaImg,
    enStock: true,
  },
  {
    id: "7",
    codigo: "CRR-007",
    nombre: "Correa de Distribución",
    categoria: "Motor",
    marca: "Gates",
    precio: 28700,
    descripcion: "Correa de distribución caucho HNBR reforzado con fibra de vidrio.",
    detalle: "Correa de distribución fabricada en caucho HNBR con refuerzo de fibra de vidrio. Alta resistencia al desgaste, calor y aceites. Intervalo de cambio recomendado: 60.000 km o 4 años. Se recomienda cambiar junto con tensor y bomba de agua.",
    compatibilidad: [
      { auto: "Renault Duster", anios: "2010-2023" },
      { auto: "Renault Fluence", anios: "2009-2017" },
      { auto: "Renault Megane III", anios: "2008-2016" },
    ],
    imagen: correaImg,
    enStock: true,
  },
  {
    id: "8",
    codigo: "DSF-008",
    nombre: "Disco de Freno Ventilado",
    categoria: "Frenos",
    marca: "Brembo",
    precio: 38500,
    descripcion: "Disco de freno ventilado delantero, hierro fundido, alta disipación.",
    detalle: "Disco de freno ventilado de hierro fundido gris de alta calidad. Diseño con aletas internas para óptima disipación del calor. Superficie rectificada de fábrica lista para instalar. Balanceado dinámicamente para evitar vibraciones.",
    compatibilidad: [
      { auto: "Chevrolet Cruze", anios: "2009-2023" },
      { auto: "Chevrolet Tracker", anios: "2013-2023" },
      { auto: "Chevrolet Onix", anios: "2012-2023" },
    ],
    imagen: discoImg,
    enStock: true,
  },
];
