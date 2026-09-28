import { requireStaffPage } from "@/lib/auth/guards";
import { PageHeader, Panel } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/ContentForms";

export default async function NewPost() {
  await requireStaffPage("content.manage");
  return <div className="max-w-4xl"><PageHeader title="New article" /><Panel><PostForm /></Panel></div>;
}
