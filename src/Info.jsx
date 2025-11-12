export const Info = ({ label, value, prefix = "", className = "", theme }) => {
  const txt = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const muted = theme === "dark" ? "text-gray-500" : "text-gray-500";
  return (
    <div className="flex flex-col text-center sm:text-right">
      <span className={`text-xs ${muted}`}>{label}</span>
      <span className={`text-sm font-medium ${txt} ${className}`}>
        {value === "--" ? "--" : `${prefix}${value}`}
      </span>
    </div>
  );
};