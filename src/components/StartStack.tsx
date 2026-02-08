import { chips, STARTING_STACK_TOTAL } from '@/lib/chips';

const PokerChip = ({ fill }: { fill: string }) => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill={fill} stroke="white" strokeOpacity="0.3" strokeWidth="1" />
    <circle
      cx="10"
      cy="10"
      r="6"
      fill="none"
      stroke="white"
      strokeOpacity="0.5"
      strokeWidth="0.75"
      strokeDasharray="3 2"
    />
    {/* Edge notches */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <rect
        key={angle}
        x="9"
        y="0.5"
        width="2"
        height="3"
        rx="0.5"
        fill="white"
        fillOpacity="0.4"
        transform={`rotate(${angle} 10 10)`}
      />
    ))}
  </svg>
);

const StartStack = () => {
  return (
    <div className="glass p-6 rounded-2xl h-full flex flex-col">
      <h2 className="text-lg font-semibold text-center mb-4">Starting Stack</h2>
      <div className="space-y-2">
        {chips.map((chip) => (
          <div key={chip.value} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PokerChip fill={chip.fill} />
              <span className="text-muted-foreground text-sm">
                {chip.value} &times; {chip.count}
              </span>
            </div>
            <span className="font-medium">{chip.value * chip.count}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
        <span className="font-semibold text-poker-gold">Total</span>
        <span className="text-2xl font-semibold text-poker-gold">{STARTING_STACK_TOTAL}</span>
      </div>
    </div>
  );
};

export default StartStack;
