import axios from "axios";
import { COMPANY_ORIGIN } from "../../config/shipping.js";

/* ===========================
 * ⚙️ CONFIGURAÇÕES DE FRETE
 * =========================== */

const SHIPPING_CONFIG = {
  MIN_WEIGHT: 0.3, // kg
  MIN_DIMENSIONS: {
    height: 2, // cm
    width: 11,
    length: 16,
  },
  CUBIC_DIVISOR: 6000,

  PA: {
    CAPITAL: {
      PAC_BASE: 12,
      SEDEX_BASE: 20,
      PAC_MULTIPLIER: 6,
      SEDEX_MULTIPLIER: 10,
      PAC_DEADLINE: "2 a 3 dias úteis",
      SEDEX_DEADLINE: "1 dia útil",
    },
    INTERIOR: {
      PAC_BASE: 18,
      SEDEX_BASE: 28,
      PAC_MULTIPLIER: 6,
      SEDEX_MULTIPLIER: 10,
      PAC_DEADLINE: "4 a 6 dias úteis",
      SEDEX_DEADLINE: "2 a 3 dias úteis",
    },
  },
};

/**
 * @param {string} cepDestino
 * @param {object} product
 */
export async function calculateShipping(cepDestino, product) {
  const response = await axios.get(
    `https://viacep.com.br/ws/${cepDestino}/json/`
  );

  if (response.data.erro) {
    throw new Error("CEP inválido");
  }

  const destino = response.data;

  if (destino.uf !== "PA") {
    return {
      available: false,
      message: "Envio ainda não disponível para outros estados.",
      destination: {
        city: destino.localidade,
        uf: destino.uf,
      },
    };
  }

  /* ===========================
   * 📦 NORMALIZAÇÃO
   * =========================== */

  const weight = Math.max(
    product.weight || SHIPPING_CONFIG.MIN_WEIGHT,
    SHIPPING_CONFIG.MIN_WEIGHT
  );

  const height = Math.max(
    product.height || SHIPPING_CONFIG.MIN_DIMENSIONS.height,
    SHIPPING_CONFIG.MIN_DIMENSIONS.height
  );

  const width = Math.max(
    product.width || SHIPPING_CONFIG.MIN_DIMENSIONS.width,
    SHIPPING_CONFIG.MIN_DIMENSIONS.width
  );

  const length = Math.max(
    product.length || SHIPPING_CONFIG.MIN_DIMENSIONS.length,
    SHIPPING_CONFIG.MIN_DIMENSIONS.length
  );

  const cubicWeight =
    (height * width * length) / SHIPPING_CONFIG.CUBIC_DIVISOR;

  const finalWeight = Math.max(weight, cubicWeight);

  /* ===========================
   * 🚚 CÁLCULO
   * =========================== */

  const isCapital = destino.localidade.toLowerCase() === "belém";
  const config = isCapital
    ? SHIPPING_CONFIG.PA.CAPITAL
    : SHIPPING_CONFIG.PA.INTERIOR;

  const pacPrice = config.PAC_BASE + finalWeight * config.PAC_MULTIPLIER;
  const sedexPrice =
    config.SEDEX_BASE + finalWeight * config.SEDEX_MULTIPLIER;

  return {
    available: true,
    origin: COMPANY_ORIGIN,
    destination: {
      city: destino.localidade,
      uf: destino.uf,
      cep: destino.cep,
    },
    package: {
      weight: Number(finalWeight.toFixed(2)),
      dimensions: { height, width, length },
    },
    services: {
      pac: {
        price: Number(pacPrice.toFixed(2)),
        deadline: config.PAC_DEADLINE,
      },
      sedex: {
        price: Number(sedexPrice.toFixed(2)),
        deadline: config.SEDEX_DEADLINE,
      },
    },
  };
}
