const ScanLine = ({ fast = false }: { fast?: boolean }) => {
  return (
    <div
      className={`absolute left-0 right-0 h-16 scan-line pointer-events-none z-10 animate-scan-sweep ${
        fast ? "[animation-duration:0.8s]" : ""
      }`}
    />
  );
};

export default ScanLine;
