import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTournament } from '@/hooks/useTournament';
import {
  Settings,
  X,
  ChevronRight,
  ChevronDown,
  Percent,
  DollarSign,
  Plus,
  Trash,
  RotateCcw,
  Timer as TimerIcon,
  Layers,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { blindStructures } from '@/lib/blindStructures';

const OrganizerPanel = () => {
  const {
    tournament,
    updateSettings,
    updateBlindStructure,
    updatePrizeDistribution,
    toggleSettingsPanel,
    updateCustomBlindStructure,
    addBlindLevel,
    removeBlindLevel,
    updateBlindLevel,
    resetTournament,
    resetCounts,
    resetLevels,
    resetTimer,
  } = useTournament();

  const { settings, isPanelOpen } = tournament;
  const { buyInAmount, reBuyAmount, prizeDistribution } = settings;

  const [draftDurations, setDraftDurations] = useState<Record<number, string>>({});

  const [expandedSections, setExpandedSections] = useState({
    buyins: true,
    structure: false,
    prizes: false,
    reset: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBuyInAmountChange = (value: string) => {
    const newAmount = parseInt(value) || 0;
    updateSettings({
      buyInAmount: newAmount > 0 ? newAmount : 1,
    });
  };

  const handleReBuyAmountChange = (value: string) => {
    const newAmount = parseInt(value) || 0;
    updateSettings({
      reBuyAmount: newAmount > 0 ? newAmount : 1,
    });
  };

  const handlePrizeDistributionTypeChange = (type: 'percentage' | 'fixed') => {
    updatePrizeDistribution({ type });
  };

  const handleAddBlindLevel = () => {
    const lastLevel =
      tournament.settings.blindStructure.levels[
        tournament.settings.blindStructure.levels.length - 1
      ];
    const newLevel = {
      id: lastLevel.id + 1,
      smallBlind: lastLevel.smallBlind * 2,
      bigBlind: lastLevel.bigBlind * 2,
      ante: lastLevel.ante > 0 ? lastLevel.ante * 2 : 0,
      duration: lastLevel.duration,
    };

    addBlindLevel(newLevel);
  };

  const handleRemoveBlindLevel = (levelId: number) => {
    removeBlindLevel(levelId);
  };

  const handleUpdateBlindLevel = (
    levelId: number,
    field: 'smallBlind' | 'bigBlind' | 'ante' | 'duration',
    value: number,
  ) => {
    if (field === 'duration') {
      updateBlindLevel(levelId, field, value);
    } else {
      updateBlindLevel(levelId, field, value);
    }
  };

  const parseDuration = (value: string): number | null => {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    if (trimmed.endsWith('s')) {
      const seconds = parseInt(trimmed.slice(0, -1));
      return !isNaN(seconds) && seconds > 0 ? seconds : null;
    }
    const minutes = parseInt(trimmed);
    return !isNaN(minutes) && minutes > 0 ? minutes * 60 : null;
  };

  const handleDurationInputChange = (levelId: number, value: string) => {
    setDraftDurations((prev) => ({ ...prev, [levelId]: value }));
  };

  const handleDurationBlur = (levelId: number) => {
    const draft = draftDurations[levelId];
    if (draft === undefined) return;
    const parsed = parseDuration(draft);
    if (parsed !== null) {
      updateBlindLevel(levelId, 'duration', parsed);
      setDraftDurations((prev) => {
        const next = { ...prev };
        delete next[levelId];
        return next;
      });
    }
  };

  const isDraftInvalid = (levelId: number): boolean => {
    const draft = draftDurations[levelId];
    if (draft === undefined) return false;
    return parseDuration(draft) === null;
  };

  const hasInvalidDurations = Object.keys(draftDurations).some((key) =>
    isDraftInvalid(Number(key)),
  );

  const handleClosePanel = () => {
    if (hasInvalidDurations) return;
    toggleSettingsPanel();
  };

  const handleResetTimer = () => {
    resetTimer();
  };

  const handleResetLevels = () => {
    resetLevels();
  };

  const handleResetCounts = () => {
    resetCounts();
  };

  const handleResetTournament = () => {
    resetTournament();
  };

  if (!isPanelOpen) {
    return (
      <Button
        variant="outline"
        className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-button hover:shadow-button-hover transition-all"
        onClick={toggleSettingsPanel}
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
      onClick={handleClosePanel}
    >
      <div
        className="w-full max-w-md bg-background border-l shadow-lg overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organizer Settings
          </h2>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleClosePanel}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => toggleSection('buyins')}
            >
              <h3 className="text-lg font-medium">Buy-in & Rebuy Settings</h3>
              {expandedSections.buyins ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {expandedSections.buyins && (
              <div className="space-y-4 pt-2 pl-2">
                <div className="space-y-2">
                  <Label htmlFor="buy-in-amount">Buy-in Amount</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="buy-in-amount"
                      type="number"
                      min="1"
                      value={buyInAmount}
                      onChange={(e) => handleBuyInAmountChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rebuy-amount">Rebuy Amount</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="rebuy-amount"
                      type="number"
                      min="1"
                      value={reBuyAmount}
                      onChange={(e) => handleReBuyAmountChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => toggleSection('structure')}
            >
              <h3 className="text-lg font-medium">Blind Structure</h3>
              {expandedSections.structure ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {expandedSections.structure && (
              <div className="space-y-4 pt-2 pl-2">
                <div className="space-y-2">
                  <Label>Select Blind Structure</Label>
                  <div className="space-y-2">
                    <RadioGroup
                      defaultValue={settings.blindStructure.name.toLowerCase()}
                      onValueChange={(value) => {
                        updateBlindStructure(value);
                      }}
                    >
                      {Object.keys(blindStructures).map((key) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={`structure-${key}`} />
                          <Label htmlFor={`structure-${key}`} className="cursor-pointer">
                            {blindStructures[key].name}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({blindStructures[key].levels.length} levels)
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Custom Blind Levels</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddBlindLevel}
                      className="h-8 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Level
                    </Button>
                  </div>

                  <div className="space-y-4 mt-4 max-h-60 overflow-y-auto pr-2">
                    {tournament.settings.blindStructure.levels.map((level) => (
                      <div
                        key={level.id}
                        className="grid grid-cols-12 gap-2 items-center border p-3 rounded-md relative"
                      >
                        <div className="col-span-3 flex flex-col">
                          <Label htmlFor={`small-blind-${level.id}`} className="text-xs mb-1">
                            Small
                          </Label>
                          <Input
                            id={`small-blind-${level.id}`}
                            type="number"
                            min="1"
                            value={level.smallBlind}
                            onChange={(e) =>
                              handleUpdateBlindLevel(
                                level.id,
                                'smallBlind',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="col-span-3 flex flex-col">
                          <Label htmlFor={`big-blind-${level.id}`} className="text-xs mb-1">
                            Big
                          </Label>
                          <Input
                            id={`big-blind-${level.id}`}
                            type="number"
                            min="1"
                            value={level.bigBlind}
                            onChange={(e) =>
                              handleUpdateBlindLevel(
                                level.id,
                                'bigBlind',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="col-span-3 flex flex-col">
                          <Label htmlFor={`ante-${level.id}`} className="text-xs mb-1">
                            Ante
                          </Label>
                          <Input
                            id={`ante-${level.id}`}
                            type="number"
                            min="0"
                            value={level.ante}
                            onChange={(e) =>
                              handleUpdateBlindLevel(
                                level.id,
                                'ante',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>

                        <div className="col-span-3 flex flex-col">
                          <Label htmlFor={`duration-${level.id}`} className="text-xs mb-1">
                            Min
                          </Label>
                          <Input
                            id={`duration-${level.id}`}
                            type="text"
                            value={
                              draftDurations[level.id] !== undefined
                                ? draftDurations[level.id]
                                : level.duration % 60 === 0
                                  ? Math.floor(level.duration / 60)
                                  : `${level.duration}s`
                            }
                            onChange={(e) => handleDurationInputChange(level.id, e.target.value)}
                            onBlur={() => handleDurationBlur(level.id)}
                            className={`h-8 text-sm ${isDraftInvalid(level.id) ? 'border-red-500' : ''}`}
                            title="Enter minutes or seconds with 's' suffix (e.g. '5' for 5 minutes or '300s' for 300 seconds)"
                          />
                          {isDraftInvalid(level.id) && (
                            <span className="text-xs text-red-500 mt-0.5">Required</span>
                          )}
                        </div>

                        {tournament.settings.blindStructure.levels.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground"
                            onClick={() => handleRemoveBlindLevel(level.id)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span className="sr-only">Remove Level</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => toggleSection('prizes')}
            >
              <h3 className="text-lg font-medium">Prize Distribution</h3>
              {expandedSections.prizes ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {expandedSections.prizes && (
              <div className="space-y-4 pt-2 pl-2">
                <div className="space-y-2">
                  <Label>Distribution Type</Label>
                  <Tabs
                    defaultValue={prizeDistribution.type}
                    onValueChange={(value) =>
                      handlePrizeDistributionTypeChange(value as 'percentage' | 'fixed')
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="percentage" className="flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        Percentage
                      </TabsTrigger>
                      <TabsTrigger value="fixed" className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="percentage" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-place-pct">1st Place Percentage</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="first-place-pct"
                              type="number"
                              min="0"
                              max="100"
                              value={prizeDistribution.first}
                              onChange={(e) =>
                                updatePrizeDistribution({ first: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="second-place-pct">2nd Place Percentage</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="second-place-pct"
                              type="number"
                              min="0"
                              max="100"
                              value={prizeDistribution.second}
                              onChange={(e) =>
                                updatePrizeDistribution({ second: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="third-place-pct">3rd Place Percentage</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="third-place-pct"
                              type="number"
                              min="0"
                              max="100"
                              value={prizeDistribution.third}
                              onChange={(e) =>
                                updatePrizeDistribution({ third: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div
                            className={`${
                              prizeDistribution.first +
                                prizeDistribution.second +
                                prizeDistribution.third !==
                              100
                                ? 'text-poker-red'
                                : 'text-muted-foreground'
                            }`}
                          >
                            Total:{' '}
                            {prizeDistribution.first +
                              prizeDistribution.second +
                              prizeDistribution.third}
                            %
                            {prizeDistribution.first +
                              prizeDistribution.second +
                              prizeDistribution.third !==
                              100 && ' (should equal 100%)'}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="fixed" className="mt-4 space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-place-fixed">1st Place Amount</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="first-place-fixed"
                              type="number"
                              min="0"
                              value={prizeDistribution.first}
                              onChange={(e) =>
                                updatePrizeDistribution({ first: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="second-place-fixed">2nd Place Amount</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="second-place-fixed"
                              type="number"
                              min="0"
                              value={prizeDistribution.second}
                              onChange={(e) =>
                                updatePrizeDistribution({ second: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="third-place-fixed">3rd Place Amount</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="third-place-fixed"
                              type="number"
                              min="0"
                              value={prizeDistribution.third}
                              onChange={(e) =>
                                updatePrizeDistribution({ third: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => toggleSection('reset')}
            >
              <h3 className="text-lg font-medium">Reset Tournament</h3>
              {expandedSections.reset ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {expandedSections.reset && (
              <div className="space-y-4 pt-2 pl-2">
                <p className="text-sm text-muted-foreground">
                  Reset specific parts of the tournament, or reset everything back to defaults.
                </p>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleResetTimer}
                >
                  <TimerIcon className="h-4 w-4" />
                  Reset Timer
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleResetLevels}
                >
                  <Layers className="h-4 w-4" />
                  Reset Levels
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleResetCounts}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset Buy-ins & Rebuys
                </Button>

                <Separator />

                <Button
                  variant="reset"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleResetTournament}
                >
                  <RotateCcw className="h-5 w-5" />
                  Reset Everything
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default OrganizerPanel;
