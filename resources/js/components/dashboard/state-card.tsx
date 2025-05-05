export const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="bg-card hover:bg-muted flex flex-col items-center justify-center border p-4 transition-colors duration-300 ease-out">
        <div className="text-muted-foreground mb-1 truncate text-sm">{label}</div>
        <div className="truncate text-sm font-semibold md:text-lg">{value}</div>
    </div>
);
