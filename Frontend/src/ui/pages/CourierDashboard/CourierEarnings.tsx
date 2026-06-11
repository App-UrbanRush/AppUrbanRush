import { useEffect, useState, useCallback } from "react";
import { Wallet, Clock, CheckCircle2, TrendingUp, Plus, Trash2, CreditCard, X, Landmark } from "lucide-react";
import toast from "react-hot-toast";
import CourierLayout from "../../components/layout/CourierLayout/CourierLayout";
import { useAuth } from "../../context/useAuth";
import { GetCourierBalanceUseCase } from "../../../application/use-cases/GetCourierBalanceUseCase";
import { ListBankAccountsUseCase } from "../../../application/use-cases/ListBankAccountsUseCase";
import { RegisterBankAccountUseCase } from "../../../application/use-cases/RegisterBankAccountUseCase";
import { DeleteBankAccountUseCase } from "../../../application/use-cases/DeleteBankAccountUseCase";
import { EarningsRepositoryImpl } from "../../../infrastructure/repositories/EarningsRepositoryImpl";
import { BankAccountsRepositoryImpl } from "../../../infrastructure/repositories/BankAccountsRepositoryImpl";
import type { CourierBalance, BankAccount, CreateBankAccountInput } from "../../../domain/types/earnings.types";
import "./CourierEarnings.css";

const earningsRepo = new EarningsRepositoryImpl();
const bankRepo = new BankAccountsRepositoryImpl();
const getBalance = new GetCourierBalanceUseCase(earningsRepo);
const listAccounts = new ListBankAccountsUseCase(bankRepo);
const registerAccount = new RegisterBankAccountUseCase(bankRepo);
const deleteAccount = new DeleteBankAccountUseCase(bankRepo);

const money = (n: number) => `$${n.toLocaleString("es-CO")}`;

const emptyForm: CreateBankAccountInput = {
  holder_name: "",
  holder_document_type: "CC",
  holder_document_number: "",
  bank_code: "1007",
  bank_name: "Bancolombia",
  account_type: "SAVINGS",
  account_number: "",
  is_default: true,
};

const CourierEarnings = () => {
  const { courierProfile, fetchCourierProfile } = useAuth();
  const [balance, setBalance] = useState<CourierBalance | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateBankAccountInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!courierProfile) fetchCourierProfile();
  }, [courierProfile, fetchCourierProfile]);

  const load = useCallback(async () => {
    if (!courierProfile?.couriers_id) return;
    setLoading(true);
    try {
      const [bal, accs] = await Promise.all([
        getBalance.execute(courierProfile.couriers_id),
        listAccounts.execute(),
      ]);
      setBalance(bal);
      setAccounts(accs);
    } catch (error) {
      console.error("Error cargando ganancias:", error);
    } finally {
      setLoading(false);
    }
  }, [courierProfile]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.holder_name || !form.account_number || !form.holder_document_number) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    setSaving(true);
    try {
      await registerAccount.execute(form);
      toast.success("Cuenta bancaria registrada");
      setShowModal(false);
      setForm(emptyForm);
      const accs = await listAccounts.execute();
      setAccounts(accs);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo registrar la cuenta");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount.execute(id);
      toast.success("Cuenta eliminada");
      setAccounts((prev) => prev.filter((a) => a.bank_account_id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo eliminar");
    }
  };

  const set = (k: keyof CreateBankAccountInput, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <CourierLayout>
      <div className="earnings">
        <h1>Mis Ganancias</h1>
        <p className="earnings-subtitle">Resumen de tus pagos y entregas</p>

        {/* Tarjetas resumen */}
        <div className="earnings-cards">
          <div className="earnings-card pending">
            <div className="earnings-card-icon"><Clock size={22} /></div>
            <div>
              <span className="earnings-card-label">Pendiente</span>
              <span className="earnings-card-value">{loading ? "…" : money(balance?.total_pending ?? 0)}</span>
            </div>
          </div>
          <div className="earnings-card paid">
            <div className="earnings-card-icon"><CheckCircle2 size={22} /></div>
            <div>
              <span className="earnings-card-label">Pagado</span>
              <span className="earnings-card-value">{loading ? "…" : money(balance?.total_paid ?? 0)}</span>
            </div>
          </div>
          <div className="earnings-card total">
            <div className="earnings-card-icon"><TrendingUp size={22} /></div>
            <div>
              <span className="earnings-card-label">Entregas</span>
              <span className="earnings-card-value">{loading ? "…" : balance?.total_earnings ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Cuentas bancarias */}
        <div className="earnings-section">
          <div className="earnings-section-head">
            <h2><Landmark size={18} /> Cuenta para recibir pagos</h2>
            <button className="earnings-add-btn" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Agregar
            </button>
          </div>
          {accounts.length === 0 ? (
            <p className="earnings-empty">No has registrado una cuenta bancaria. Agrégala para recibir tus pagos.</p>
          ) : (
            <div className="earnings-accounts">
              {accounts.map((acc) => (
                <div key={acc.bank_account_id} className="earnings-account">
                  <div className="earnings-account-icon"><CreditCard size={20} /></div>
                  <div className="earnings-account-info">
                    <span className="earnings-account-bank">
                      {acc.bank_name} {acc.is_default && <span className="earnings-default-chip">Principal</span>}
                    </span>
                    <span className="earnings-account-num">
                      {acc.account_type === "SAVINGS" ? "Ahorros" : "Corriente"} · {acc.account_number}
                    </span>
                  </div>
                  <button className="earnings-account-del" onClick={() => handleDelete(acc.bank_account_id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle de entregas */}
        <div className="earnings-section">
          <h2><Wallet size={18} /> Detalle de entregas</h2>
          {loading ? (
            <p className="earnings-empty">Cargando…</p>
          ) : !balance || balance.earnings.length === 0 ? (
            <p className="earnings-empty">Aún no tienes ganancias registradas.</p>
          ) : (
            <div className="earnings-table">
              {balance.earnings.map((e) => (
                <div key={e.earning_id} className="earnings-row">
                  <span className="earnings-row-order">#{e.order_id.slice(-6).toUpperCase()}</span>
                  <span className="earnings-row-fee">{money(e.delivery_fee)}</span>
                  <span className={`earnings-row-status ${e.status.toLowerCase()}`}>
                    {e.status === "PAID" ? "Pagado" : "Pendiente"}
                  </span>
                  <span className="earnings-row-date">
                    {e.created_at ? new Date(e.created_at).toLocaleDateString("es-CO") : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal cuenta bancaria */}
      {showModal && (
        <div className="earnings-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="earnings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="earnings-modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h2><Landmark size={20} /> Nueva cuenta bancaria</h2>

            <label>Titular</label>
            <input value={form.holder_name} onChange={(e) => set("holder_name", e.target.value)} placeholder="Nombre del titular" />

            <div className="earnings-form-row">
              <div>
                <label>Tipo doc.</label>
                <select value={form.holder_document_type} onChange={(e) => set("holder_document_type", e.target.value)}>
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">PP</option>
                </select>
              </div>
              <div className="grow">
                <label>Número de documento</label>
                <input value={form.holder_document_number} onChange={(e) => set("holder_document_number", e.target.value)} placeholder="1020304050" />
              </div>
            </div>

            <label>Banco</label>
            <input value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} placeholder="Bancolombia" />

            <div className="earnings-form-row">
              <div className="grow">
                <label>Tipo de cuenta</label>
                <select value={form.account_type} onChange={(e) => set("account_type", e.target.value)}>
                  <option value="SAVINGS">Ahorros</option>
                  <option value="CHECKING">Corriente</option>
                </select>
              </div>
              <div className="grow">
                <label>Código banco</label>
                <input value={form.bank_code} onChange={(e) => set("bank_code", e.target.value)} placeholder="1007" />
              </div>
            </div>

            <label>Número de cuenta</label>
            <input value={form.account_number} onChange={(e) => set("account_number", e.target.value)} placeholder="12345678901" />

            <button className="earnings-modal-save" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar cuenta"}
            </button>
          </div>
        </div>
      )}
    </CourierLayout>
  );
};

export default CourierEarnings;
