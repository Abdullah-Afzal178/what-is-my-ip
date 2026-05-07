type DetailCardProps = {
  label: string;
  value: string;
};

export function DetailCard({ label, value }: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-base font-semibold text-slate-950 break-words">
        {value}
      </dd>
    </div>
  );
}

