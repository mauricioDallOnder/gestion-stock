"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { lotesEstoqueMock } from "@/features/estoque/estoqueMock";
import { produtosMock } from "@/features/produtos/produtosMock";
import { LoteEstoque, LoteEstoqueFormValues } from "@/types/estoque";
import {
  FechamentoMensal,
  LinhaFechamentoMensal,
  MesFechamento,
  StatusFechamento,
} from "@/types/fechamento";
import { Produto, ProdutoFormValues } from "@/types/produto";
import {
  mettreAJourLotStock,
  creerLotStock,
} from "@/features/estoque/estoqueUtils";
import {
  atualizarProduto,
  criarProduto,
} from "@/features/produtos/produtoUtils";
import {
  calcularTotaisFechamento,
  gerarLinhasFechamento,
  recalcularLinhaFechamento,
} from "@/features/fechamento/fechamentoUtils";

// ─── Chaves do localStorage ───────────────────────────────────────────────────
const STORAGE_KEYS = {
  produtos: "estoque_escola:produtos",
  lotes: "estoque_escola:lotes",
  fechamentos: "estoque_escola:fechamentos",
} as const;

// ─── Helpers de persistência ──────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignora erros de quota
  }
}

// ─── Tipos do contexto ────────────────────────────────────────────────────────
export type AppContextValue = {
  // Produtos
  produtos: Produto[];
  adicionarProduto: (values: ProdutoFormValues) => void;
  editarProduto: (id: string, values: ProdutoFormValues) => void;
  toggleAtivoProduto: (id: string) => void;
  deletarProduto: (id: string) => void;

  // Lotes de estoque
  lotes: LoteEstoque[];
  adicionarLote: (values: LoteEstoqueFormValues) => void;
  editarLote: (id: string, values: LoteEstoqueFormValues) => void;
  deletarLote: (id: string) => void;

  // Fechamentos mensais
  fechamentos: FechamentoMensal[];
  getFechamento: (ano: number, mes: MesFechamento) => FechamentoMensal | undefined;
  iniciarOuCarregarFechamento: (ano: number, mes: MesFechamento) => FechamentoMensal;
  salvarRascunhoFechamento: (fechamento: FechamentoMensal) => void;
  atualizarLinhaFechamento: (
    fechamentoId: string,
    linhaId: string,
    campo: "estoqueAtualContado" | "observacao",
    valor: number | string
  ) => void;
  fecharMes: (fechamentoId: string) => void;
  reabrirMes: (fechamentoId: string) => void;
  regenerarLinhas: (fechamentoId: string) => void;
};

// ─── Criação do contexto ──────────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext deve ser usado dentro de AppProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>(() =>
    loadFromStorage(STORAGE_KEYS.produtos, produtosMock)
  );

  const [lotes, setLotes] = useState<LoteEstoque[]>(() =>
    loadFromStorage(STORAGE_KEYS.lotes, lotesEstoqueMock)
  );

  const [fechamentos, setFechamentos] = useState<FechamentoMensal[]>(() =>
    loadFromStorage(STORAGE_KEYS.fechamentos, [])
  );

  // Persistir automaticamente no localStorage sempre que mudar
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.produtos, produtos);
  }, [produtos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.lotes, lotes);
  }, [lotes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.fechamentos, fechamentos);
  }, [fechamentos]);

  // ─── Produtos ───────────────────────────────────────────────────────────────
  const adicionarProduto = useCallback((values: ProdutoFormValues) => {
    setProdutos((cur) => [criarProduto(values), ...cur]);
  }, []);

  const editarProduto = useCallback(
    (id: string, values: ProdutoFormValues) => {
      setProdutos((cur) =>
        cur.map((p) => (p.id === id ? atualizarProduto(p, values) : p))
      );
    },
    []
  );

  const toggleAtivoProduto = useCallback((id: string) => {
    setProdutos((cur) =>
      cur.map((p) =>
        p.id === id
          ? { ...p, ativo: !p.ativo, atualizadoEm: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const deletarProduto = useCallback((id: string) => {
    setProdutos((cur) => cur.filter((p) => p.id !== id));
  }, []);

  // ─── Lotes ──────────────────────────────────────────────────────────────────
  const adicionarLote = useCallback((values: LoteEstoqueFormValues) => {
    setLotes((cur) => [creerLotStock(values), ...cur]);
  }, []);

  const editarLote = useCallback(
    (id: string, values: LoteEstoqueFormValues) => {
      setLotes((cur) =>
        cur.map((l) => (l.id === id ? mettreAJourLotStock(l, values) : l))
      );
    },
    []
  );

  const deletarLote = useCallback((id: string) => {
    setLotes((cur) => cur.filter((l) => l.id !== id));
  }, []);

  // ─── Fechamentos ────────────────────────────────────────────────────────────
  const getFechamento = useCallback(
    (ano: number, mes: MesFechamento) =>
      fechamentos.find((f) => f.ano === ano && f.mes === mes),
    [fechamentos]
  );

  const iniciarOuCarregarFechamento = useCallback(
    (ano: number, mes: MesFechamento): FechamentoMensal => {
      const existente = fechamentos.find((f) => f.ano === ano && f.mes === mes);
      if (existente) return existente;

      const linhas = gerarLinhasFechamento({
        produtos,
        lotes,
        ano,
        mes,
      });

      const novo: FechamentoMensal = {
        id: crypto.randomUUID(),
        ano,
        mes,
        status: "Brouillon" ,
        linhas,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      setFechamentos((cur) => [...cur, novo]);
      return novo;
    },
    [fechamentos, lotes, produtos]
  );

  const salvarRascunhoFechamento = useCallback(
    (fechamento: FechamentoMensal) => {
      const atualizado: FechamentoMensal = {
        ...fechamento,
        status: "Brouillon" ,
        atualizadoEm: new Date().toISOString(),
      };
      setFechamentos((cur) =>
        cur.map((f) => (f.id === fechamento.id ? atualizado : f))
      );
    },
    []
  );

  const atualizarLinhaFechamento = useCallback(
    (
      fechamentoId: string,
      linhaId: string,
      campo: "estoqueAtualContado" | "observacao",
      valor: number | string
    ) => {
      setFechamentos((cur) =>
        cur.map((f) => {
          if (f.id !== fechamentoId) return f;

          const linhasAtualizadas = f.linhas.map((linha) => {
            if (linha.id !== linhaId) return linha;

            const linhaAtualizada: LinhaFechamentoMensal =
              campo === "estoqueAtualContado"
                ? recalcularLinhaFechamento({
                    ...linha,
                    estoqueAtualContado: Number.isNaN(Number(valor))
                      ? 0
                      : Number(valor),
                  })
                : { ...linha, observacao: String(valor) };

            return linhaAtualizada;
          });

          return {
            ...f,
            linhas: linhasAtualizadas,
            atualizadoEm: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const fecharMes = useCallback((fechamentoId: string) => {
    setFechamentos((cur) =>
      cur.map((f) =>
        f.id === fechamentoId
          ? {
              ...f,
              status: "Clôturé" as StatusFechamento,
              fechadoEm: new Date().toISOString(),
              atualizadoEm: new Date().toISOString(),
            }
          : f
      )
    );
  }, []);

  const reabrirMes = useCallback((fechamentoId: string) => {
    setFechamentos((cur) =>
      cur.map((f) =>
        f.id === fechamentoId
          ? {
              ...f,
              status: "Rouvert" as StatusFechamento,
              fechadoEm: undefined,
              atualizadoEm: new Date().toISOString(),
            }
          : f
      )
    );
  }, []);

  const regenerarLinhas = useCallback(
    (fechamentoId: string) => {
      setFechamentos((cur) =>
        cur.map((f) => {
          if (f.id !== fechamentoId) return f;

          const linhas = gerarLinhasFechamento({
            produtos,
            lotes,
            ano: f.ano,
            mes: f.mes,
          });

          return {
            ...f,
            linhas,
            status: "Brouillon"  as StatusFechamento,
            fechadoEm: undefined,
            atualizadoEm: new Date().toISOString(),
          };
        })
      );
    },
    [lotes, produtos]
  );

  const value: AppContextValue = {
    produtos,
    adicionarProduto,
    editarProduto,
    toggleAtivoProduto,
    deletarProduto,
    lotes,
    adicionarLote,
    editarLote,
    deletarLote,
    fechamentos,
    getFechamento,
    iniciarOuCarregarFechamento,
    salvarRascunhoFechamento,
    atualizarLinhaFechamento,
    fecharMes,
    reabrirMes,
    regenerarLinhas,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
