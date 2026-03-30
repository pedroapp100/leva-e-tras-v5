import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Bike,
  Clock,
  MapPin,
  Zap,
  Shield,
  Package,
  ArrowRight,
  CheckCircle2,
  Phone,
  Star,
  ChevronDown,
  Timer,
  Route,
  BadgeCheck,
} from "lucide-react";
import heroImage from "@/assets/hero-moto-delivery.jpg";
import logoImage from "@/assets/logo-leva-e-traz.png";
import { useRef } from "react";

/* ── Animations ── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ── Data ── */
const advantages = [
  { icon: Zap, title: "40 min", subtitle: "Tempo médio", desc: "Entregas ultra-rápidas na região metropolitana, desviando do trânsito com agilidade." },
  { icon: Clock, title: "24/7", subtitle: "Operação", desc: "Disponibilidade total com entregadores em todos os turnos, inclusive feriados." },
  { icon: MapPin, title: "100%", subtitle: "Cobertura", desc: "Toda a região metropolitana coberta, incluindo bairros de difícil acesso." },
  { icon: Shield, title: "Seguro", subtitle: "Incluso", desc: "Rastreamento em tempo real e seguro contra avarias em todas as entregas." },
  { icon: Package, title: "Flexível", subtitle: "Volumes", desc: "De documentos a caixas médias — baús adaptados para cada necessidade." },
  { icon: Star, title: "4.9★", subtitle: "Avaliação", desc: "Motoboys avaliados continuamente, garantindo excelência e confiança." },
];

const steps = [
  { icon: Package, title: "Solicite", desc: "Crie pelo painel ou API informando coleta e entrega." },
  { icon: Route, title: "Designamos", desc: "Motoboy qualificado atribuído por proximidade e rating." },
  { icon: Timer, title: "Acompanhe", desc: "Rastreie em tempo real do aceite à confirmação." },
  { icon: BadgeCheck, title: "Entregue", desc: "Comprovante digital com foto, assinatura e horário." },
];

const stats = [
  { value: "8.500+", label: "Entregas mensais" },
  { value: "38min", label: "Tempo médio" },
  { value: "99.2%", label: "Taxa de sucesso" },
  { value: "120+", label: "Motoboys ativos" },
];

const segments = [
  "E-commerce", "Farmácias", "Documentos", "Peças Automotivas", "Alimentos", "Laboratórios", "Escritórios", "Varejo",
];

const testimonials = [
  { name: "Carlos Silva", role: "Gerente de Logística, FastShop", text: "Reduziu nosso tempo médio de entrega em 60%. A plataforma de rastreamento é impecável." },
  { name: "Ana Oliveira", role: "CEO, FarmaExpress", text: "Atendimento 24h foi um diferencial enorme. Nossos clientes recebem medicamentos em menos de 1 hora." },
  { name: "Roberto Santos", role: "Diretor, DocSign", text: "Confiabilidade de 99% na entrega de documentos sensíveis. Mudou completamente nossa operação." },
];

export default function EntregasMotoPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ═══════════════════════════════════════════════
          NAVBAR — Glassmorphism
      ═══════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <img src={logoImage} alt="Leva e Traz" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all" />
            <div className="hidden sm:block">
              <span className="font-bold text-sm block leading-tight">Leva e Traz</span>
              <span className="text-[10px] text-muted-foreground">Entregas por Moto</span>
            </div>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#vantagens" className="hover:text-foreground transition-colors">Vantagens</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Início</Button>
            <Button size="sm" className="rounded-lg shadow-lg shadow-primary/25" onClick={() => navigate("/login")}>
              Acessar Painel
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          HERO — Full-screen cinematic
      ═══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] max-h-[1000px] flex items-center overflow-hidden">
        {/* Parallax background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 -top-20">
          <img
            src={heroImage}
            alt="Motoboy em entrega"
            className="w-full h-[120%] object-cover object-center"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl space-y-8"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-primary">
              <Bike className="h-4 w-4" />
              Serviço Premium de Entregas por Moto
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Velocidade que{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                  transforma
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-primary/40 origin-left rounded-full"
                />
              </span>
              <br />
              sua logística
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Frota de motoboys qualificados, rastreamento em tempo real e entregas em até 40 minutos na região metropolitana.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="h-13 px-8 rounded-xl text-base shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all" onClick={() => navigate("/login")}>
                Solicitar entrega
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-13 px-8 rounded-xl text-base backdrop-blur-sm bg-background/50" onClick={() => {
                document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Como funciona
              </Button>
            </motion.div>

            {/* Micro stats */}
            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4">
              {[
                { value: "40min", label: "Tempo médio" },
                { value: "99.2%", label: "Sucesso" },
                { value: "24/7", label: "Operação" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary tabular-nums">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BAR — Floating glass
      ═══════════════════════════════════════════════ */}
      <section className="relative z-20 -mt-16">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border shadow-2xl shadow-background/50"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="bg-card/90 backdrop-blur-xl p-6 text-center">
                <p className="text-2xl lg:text-3xl font-bold text-primary tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          VANTAGENS — Bento grid
      ═══════════════════════════════════════════════ */}
      <section id="vantagens" className="py-24 lg:py-32">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Diferenciais
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              Por que a Leva e Traz?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
              Tecnologia, velocidade e confiabilidade em cada entrega.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {advantages.map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                className="group relative rounded-2xl border border-border bg-card p-8 overflow-hidden hover:border-primary/30 transition-all duration-500"
              >
                {/* Glow on hover */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/0 group-hover:bg-primary/5 blur-[60px] transition-all duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">{item.title}</span>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          COMO FUNCIONA — Timeline
      ═══════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-24 lg:py-32 bg-muted/20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Processo
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              4 passos simples
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            {steps.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="flex gap-6 sm:gap-10 relative"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-primary/20 to-border my-2" />
                  )}
                </div>

                <div className={`pb-12 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-primary/50 tabular-nums">0{i + 1}</span>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed max-w-md">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          DEPOIMENTOS — Glassmorphism cards
      ═══════════════════════════════════════════════ */}
      <section id="depoimentos" className="py-24 lg:py-32">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Depoimentos
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight">
              O que nossos clientes dizem
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={scaleIn}
                className="rounded-2xl border border-border bg-card p-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                
                {/* Quote mark */}
                <span className="text-6xl font-serif text-primary/10 absolute top-4 right-6 leading-none">"</span>
                
                <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SEGMENTOS — Pill tags
      ═══════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-muted/20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Segmentos
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Atendemos diversos setores
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-12 text-lg">
              Soluções adaptadas para cada tipo de operação logística.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {segments.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-default"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — Dramatic gradient
      ═══════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-primary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[150px]" />
        
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              Pronto para{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                acelerar
              </span>{" "}
              suas entregas?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-md mx-auto">
              Cadastre-se gratuitamente e comece a enviar entregas por moto com a Leva e Traz.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="h-13 px-8 rounded-xl text-base shadow-xl shadow-primary/30" onClick={() => navigate("/login")}>
                Começar agora — é grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-13 px-8 rounded-xl text-base gap-2">
                <Phone className="h-4 w-4" />
                Falar com vendas
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Leva e Traz" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-sm text-muted-foreground">© 2026 Leva e Traz — Plataforma Logística</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Início</button>
            <button onClick={() => navigate("/entregas-moto")} className="hover:text-foreground transition-colors">Entregas Moto</button>
            <button onClick={() => navigate("/login")} className="hover:text-foreground transition-colors">Entrar</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
