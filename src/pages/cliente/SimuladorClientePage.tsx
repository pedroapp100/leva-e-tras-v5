import { PageContainer } from "@/components/shared/PageContainer";
import { SimuladorOperacoes } from "@/components/shared/SimuladorOperacoes";

// In production, this would come from auth context
const CLIENTE_ID = "mock-cliente-001";

export default function SimuladorClientePage() {
  return (
    <PageContainer
      title="Simulador de Operações"
      subtitle="Simule o custo das suas entregas antes de solicitar."
    >
      <SimuladorOperacoes clienteId={CLIENTE_ID} />
    </PageContainer>
  );
}
