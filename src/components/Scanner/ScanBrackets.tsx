const ScanBrackets = () => {
  const bracketStyle = "absolute w-8 h-8 border-primary";

  return (
    <div className="absolute inset-12 sm:inset-24 pointer-events-none z-10">
      {/* Top-left */}
      <div className={`${bracketStyle} top-0 left-0 border-t-2 border-l-2 rounded-tl-lg`} />
      {/* Top-right */}
      <div className={`${bracketStyle} top-0 right-0 border-t-2 border-r-2 rounded-tr-lg`} />
      {/* Bottom-left */}
      <div className={`${bracketStyle} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg`} />
      {/* Bottom-right */}
      <div className={`${bracketStyle} bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg`} />
    </div>
  );
};

export default ScanBrackets;
