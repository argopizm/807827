import { CalendarClock, Wallet } from "lucide-react";
import { proposalPrice, type ProposalTerms } from "@/lib/proposals";
import styles from "./Proposal.module.css";

export default function ProposalSummary({ proposal }: { proposal: ProposalTerms }) {
  if (proposal.amount_kurus === null || proposal.delivery_days === null || !proposal.proposal_message) return <p className={styles.legacy}>Bu teklif önceki sürümde gönderildi; fiyat ve teslim süresi kaydedilmemiş. Ayrıntıları mesajlaşarak netleştirin.</p>;
  return <div className={styles.summary}><div className={styles.terms}><span><Wallet size={16}/><strong>{proposalPrice(proposal.amount_kurus)}</strong><small>Teklif fiyatı</small></span><span><CalendarClock size={16}/><strong>{proposal.delivery_days} gün</strong><small>Teslim süresi</small></span></div><p>{proposal.proposal_message}</p></div>;
}
