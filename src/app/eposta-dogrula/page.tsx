import type { Metadata } from "next";
import EmailConfirmation from "@/components/EmailConfirmation";
export const metadata: Metadata={title:"E-posta doğrulama",robots:{index:false,follow:false}};
export default function ConfirmEmailPage(){return <EmailConfirmation/>;}
