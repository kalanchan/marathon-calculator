import React, { useState, useEffect } from 'react';
import './App.css';

// Pace Setting Button Component
const PaceButton = ({ startKm, endKm, onSetPace, label, defaultPace }) => {
  const [showInput, setShowInput] = useState(false);
  const [paceInput, setPaceInput] = useState(defaultPace || "5:00");
  
  const handleSetPace = () => {
    if (onSetPace(startKm, endKm, paceInput)) {
      setShowInput(false);
    }
  };

  // Format the segment description
  const segmentDescription = `km ${startKm} to ${endKm}`;
  
  return (
    <span>
      {showInput ? (
        <span style={{ 
          display: 'inline-flex', 
          flexDirection: 'column', 
          gap: '8px',
          backgroundColor: '#f0f9ff',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
            Set pace for {segmentDescription}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              style={{ 
                width: '3.5rem', 
                padding: '2px 4px', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                fontSize: '12px' 
              }}
              type="text"
              value={paceInput}
              onChange={(e) => setPaceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetPace();
                  e.preventDefault();
                } else if (e.key === 'Escape') {
                  setShowInput(false);
                  e.preventDefault();
                }
              }}
              placeholder="m:ss"
              autoFocus
            />
            <button
              onClick={handleSetPace}
              style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                backgroundColor: '#10b981', 
                color: 'white', 
                borderRadius: '4px',
                border: 'none' 
              }}
            >
              Set
            </button>
            <button
              onClick={() => setShowInput(false)}
              style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                backgroundColor: '#d1d5db', 
                borderRadius: '4px',
                border: 'none' 
              }}
            >
              ✕
            </button>
          </div>
        </span>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          style={{ 
            fontSize: '14px', 
            padding: '8px 12px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            borderRadius: '4px',
            marginLeft: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          title={`Set pace for ${segmentDescription}`}
        >
          Set Segment Pace
        </button>
      )}
    </span>
  );
};

const MarathonCalculator = () => {
  // Marathon constants
  const FULL_MARATHON_KM = 42.195;
  const HALF_MARATHON_KM = 21.0975;
  
  // Main application states
  const [showInputForm, setShowInputForm] = useState(true);
  const [targetTimeInput, setTargetTimeInput] = useState("03:30:00");
  const [currentTargetTime, setCurrentTargetTime] = useState("");
  const [kmPaces, setKmPaces] = useState([]);
  const [isHalfMarathon, setIsHalfMarathon] = useState(false);
  
  // Get the active marathon distance based on selected mode
  const activeDistance = isHalfMarathon ? HALF_MARATHON_KM : FULL_MARATHON_KM;
  
  // Define key distances for split times
  const keySplits = [
    { label: '5K', distance: 5 },
    { label: '10K', distance: 10 },
    { label: '15K', distance: 15 },
    { label: '20K', distance: 20 },
    { label: 'Half', distance: HALF_MARATHON_KM },
    { label: '25K', distance: 25 },
    { label: '30K', distance: 30 },
    { label: '35K', distance: 35 },
    { label: '40K', distance: 40 },
    { label: 'Full', distance: FULL_MARATHON_KM }
  ];
  
  // Parse time string to seconds
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    const parts = timeStr.trim().split(':').map(Number);
    
    if (parts.length === 3) { // hh:mm:ss
      const [hours, minutes, seconds] = parts;
      return (hours * 3600) + (minutes * 60) + seconds;
    } else if (parts.length === 2) { // mm:ss
      const [minutes, seconds] = parts;
      return (minutes * 60) + seconds;
    }
    
    return 0;
  };
  
  // Format seconds to hh:mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format seconds to mm:ss for pace
  const formatPace = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate average pace from target time
  const calculateAveragePace = (timeStr) => {
    const totalSeconds = parseTimeToSeconds(timeStr);
    return totalSeconds / activeDistance;
  };
  
  // Calculate time for a specific kilometer segment
  const getTimeForKm = (kmIndex, distance = 1.0) => {
    if (!kmPaces[kmIndex]) return 0;
    return kmPaces[kmIndex] * distance;
  };
  
  // Calculate cumulative time at a specific distance
  const getCumulativeTime = (distance) => {
    if (distance <= 0 || kmPaces.length === 0) return 0;
    
    let totalTime = 0;
    
    // Add time for all complete kilometers
    for (let km = 1; km <= Math.min(Math.floor(distance), 42); km++) {
      totalTime += getTimeForKm(km);
    }
    
    // Calculate partial kilometer
    const partialKm = distance - Math.floor(distance);
    if (partialKm > 0) {
      // For the final 0.195 km
      if (Math.floor(distance) === 42) {
        totalTime += getTimeForKm(42, partialKm);
      } else {
        // For other partial distances
        totalTime += getTimeForKm(Math.floor(distance) + 1, partialKm);
      }
    }
    
    return totalTime;
  };
  
  // Handle submit of target time
  const handleCalculate = () => {
    // Validate time format
    const totalSeconds = parseTimeToSeconds(targetTimeInput);
    if (totalSeconds > 0) {
      // Set the current target time
      setCurrentTargetTime(targetTimeInput);
      
      // Calculate average pace
      const avgPace = calculateAveragePace(targetTimeInput);
      
      // Create new paces array
      const newPaces = Array(43).fill(avgPace);
      setKmPaces(newPaces);
      
      // Hide the input form, show the results
      setShowInputForm(false);
    } else {
      alert("Please enter a valid time in hh:mm:ss format");
    }
  };
  
  // Handle going back to change the target time
  const handleChangeTime = () => {
    setShowInputForm(true);
  };
  
  // Parse pace input string to seconds
  const parsePaceInput = (paceStr) => {
    try {
      // Handle format like "5:30" for 5 min 30 seconds
      const parts = paceStr.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        if (!isNaN(minutes) && !isNaN(seconds)) {
          return (minutes * 60) + seconds;
        }
      }
      
      // Try general time parsing as fallback
      return parseTimeToSeconds(paceStr);
    } catch (e) {
      return null; // Error in parsing
    }
  };
  
  // Set pace for a range of kilometers
  const handleSetRangePace = (startKm, endKm, paceStr) => {
    const newPaceInSeconds = parsePaceInput(paceStr);
    
    if (!newPaceInSeconds || newPaceInSeconds <= 0) return false;
    
    const newPaces = [...kmPaces];
    
    // Update all kilometers in the range
    for (let km = startKm; km <= endKm; km++) {
      if (km <= 42) {
        newPaces[km] = newPaceInSeconds;
      }
    }
    
    setKmPaces(newPaces);
    return true;
  };
  
  // Handle changes to individual km paces
  const handleKmPaceChange = (km, paceStr) => {
    const newPaceInSeconds = parsePaceInput(paceStr);
    
    if (!newPaceInSeconds || newPaceInSeconds <= 0) return;
    
    const newPaces = [...kmPaces];
    newPaces[km] = newPaceInSeconds;
    setKmPaces(newPaces);
  };
  
  // Calculate the current average pace based on all kilometer paces
  const calculateCurrentAveragePace = () => {
    if (kmPaces.length === 0) return 0;
    
    let totalSeconds = 0;
    const maxKm = isHalfMarathon ? Math.floor(HALF_MARATHON_KM) : 42;
    
    // Sum up all kilometer paces (ignoring index 0 which is unused)
    for (let i = 1; i <= maxKm; i++) {
      totalSeconds += kmPaces[i] || 0;
    }
    
    // Add the partial kilometer
    if (isHalfMarathon) {
      const partial = HALF_MARATHON_KM - Math.floor(HALF_MARATHON_KM);
      totalSeconds += (kmPaces[Math.ceil(HALF_MARATHON_KM)] || 0) * partial;
    } else {
      // Full marathon: add the final 0.195
      totalSeconds += (kmPaces[42] || 0) * 0.195;
    }
    
    // Return average seconds per kilometer
    return totalSeconds / activeDistance;
  };
  
  // Calculate ranges for key splits for setting paces
  const getSplitRanges = () => {
    const ranges = [];
    
    // Loop through splits and create ranges
    for (let i = 0; i < keySplits.length; i++) {
      const currentSplit = keySplits[i];
      const prevSplit = i > 0 ? keySplits[i-1] : { distance: 0, label: 'Start' };
      
      const startKm = Math.ceil(prevSplit.distance);
      const endKm = Math.floor(currentSplit.distance);
      
      // Only add if there are kilometers in this range
      if (endKm >= startKm) {
        ranges.push({
          label: currentSplit.label,
          startKm: startKm + 1,
          endKm: endKm,
          segmentLabel: i === 0 ? 
            `Start to ${currentSplit.label}` : 
            `${prevSplit.label} to ${currentSplit.label}`
        });
      }
    }
    
    return ranges;
  };
  
  // Calculate half marathon statistics
  const calculateHalfStats = () => {
    if (kmPaces.length === 0) return { first: {}, second: {} };
    
    // First half (1 to half marathon distance)
    let firstHalfSeconds = 0;
    for (let km = 1; km <= Math.floor(HALF_MARATHON_KM); km++) {
      firstHalfSeconds += kmPaces[km] || 0;
    }
    // Add partial km
    const partialFirstKm = HALF_MARATHON_KM - Math.floor(HALF_MARATHON_KM);
    firstHalfSeconds += (kmPaces[Math.ceil(HALF_MARATHON_KM)] || 0) * partialFirstKm;
    
    // Second half (rest to finish)
    let secondHalfSeconds = 0;
    for (let km = Math.ceil(HALF_MARATHON_KM); km <= 42; km++) {
      // For the first km, only count what wasn't counted in first half
      if (km === Math.ceil(HALF_MARATHON_KM)) {
        secondHalfSeconds += (kmPaces[km] || 0) * (1 - partialFirstKm);
      } else {
        secondHalfSeconds += kmPaces[km] || 0;
      }
    }
    // Add final partial km
    secondHalfSeconds += (kmPaces[42] || 0) * 0.195;
    
    // Calculate average paces
    const firstHalfAvgPace = firstHalfSeconds / HALF_MARATHON_KM;
    const secondHalfAvgPace = secondHalfSeconds / (FULL_MARATHON_KM - HALF_MARATHON_KM);
    
    return {
      first: {
        time: firstHalfSeconds,
        pace: firstHalfAvgPace
      },
      second: {
        time: secondHalfSeconds,
        pace: secondHalfAvgPace
      }
    };
  };
  
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{isHalfMarathon ? 'Half' : 'Full'} Marathon Calculator</h1>
      
      {showInputForm ? (
        /* Target Time Input Form */
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 font-medium">Half Marathon</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={isHalfMarathon}
                  onChange={() => setIsHalfMarathon(!isHalfMarathon)}
                  className="sr-only" 
                />
                <div className="block bg-gray-300 w-14 h-7 rounded-full"></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition ${isHalfMarathon ? 'transform translate-x-7' : ''}`}></div>
              </div>
              
            </label>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }} className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
            <label className="font-semibold">
              Target {isHalfMarathon ? 'Half' : 'Full'} Marathon Time (hh:mm:ss):
              <input 
                className="ml-2 px-2 py-1 border rounded"
                type="text" 
                value={targetTimeInput} 
                onChange={(e) => setTargetTimeInput(e.target.value)}
                placeholder="03:30:00"
              />
            </label>
            <button 
              type="submit"
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Calculate
            </button>
          </form>
          
          
        </div>
      ) : (
        /* Calculator Results */
        <div>
          {/* Summary Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Summary for {isHalfMarathon ? 'Half' : 'Full'} Marathon - {currentTargetTime}</h2>
              <button 
                onClick={handleChangeTime}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Change Target Time
              </button>
            </div>
            <p className="mb-2">
              Average Pace: <span className="font-semibold">{formatPace(calculateCurrentAveragePace())}</span> min/km
              {formatPace(calculateCurrentAveragePace()) !== formatPace(calculateAveragePace(currentTargetTime)) && (
                <span className="ml-2 text-gray-500">
                  (Original: {formatPace(calculateAveragePace(currentTargetTime))})
                </span>
              )}
            </p>
            <p className="mb-2">
              Projected Finish: <span className="font-semibold">{formatTime(getCumulativeTime(activeDistance))}</span>
              {formatTime(getCumulativeTime(activeDistance)) !== currentTargetTime && (
                <span className="ml-2 text-gray-500">
                  (Target: {currentTargetTime})
                </span>
              )}
            </p>
            
            {/* Marathon Analysis */}
            {!isHalfMarathon && (
              <div className="mb-2 p-2 bg-yellow-50 rounded">
                <h3 className="font-bold text-sm mb-1">Marathon Analysis:</h3>
                {(() => {
                  const halfStats = calculateHalfStats();
                  return (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>First Half:</strong><br/>
                        Time: {formatTime(halfStats.first.time)}<br/>
                        Pace: {formatPace(halfStats.first.pace)} min/km
                      </div>
                      <div>
                        <strong>Second Half:</strong><br/>
                        Time: {formatTime(halfStats.second.time)}<br/>
                        Pace: {formatPace(halfStats.second.pace)} min/km
                      </div>
                      <div className="col-span-2 mt-1 text-xs">
                        Difference: {formatTime(Math.abs(halfStats.second.time - halfStats.first.time))}
                        {halfStats.second.time > halfStats.first.time ? " slower" : " faster"}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            <h3 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '18px' }}>Key Split Times:</h3>
            <div className="split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '10px', margin: '12px 0', maxWidth: '100%', overflowX: 'hidden' }}>
              {keySplits
                .filter(split => !isHalfMarathon || split.distance <= HALF_MARATHON_KM)
                .map(({ label, distance }, index) => {
                // Get the previous split distance for pace setting
                const prevDistance = index > 0 ? keySplits[index-1].distance : 0;
                const prevLabel = index > 0 ? keySplits[index-1].label : "0K";
                const startKm = Math.ceil(prevDistance);
                const endKm = Math.floor(distance);
                
                return (
                  <div key={label} style={{ 
                    padding: '12px', 
                    backgroundColor: 'white', 
                    borderRadius: '6px', 
                    margin: '2px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s ease-in-out',
                    cursor: 'default'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                          {label} Split
                        </span>
                        <span style={{ fontSize: '18px' }}>
                          {formatTime(getCumulativeTime(distance))}
                        </span>
                        <span style={{ fontSize: '14px', color: '#555' }}>
                          Segment Pace: {(() => {
                            // Calculate average pace for this segment
                            let segmentPaceSum = 0;
                            let count = 0;
                            for(let km = startKm + 1; km <= endKm; km++) {
                              if (kmPaces[km]) {
                                segmentPaceSum += kmPaces[km];
                                count++;
                              }
                            }
                            return formatPace(count > 0 ? segmentPaceSum / count : 0);
                          })()} min/km
                        </span>
                      </div>
                      {endKm >= startKm && (
                        <PaceButton 
                          startKm={startKm + 1} 
                          endKm={endKm}
                          label={label}
                          defaultPace={formatPace(calculateCurrentAveragePace())}
                          onSetPace={handleSetRangePace}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Kilometer Splits Table */}
          <div className="overflow-auto">
            <h2 className="text-xl font-bold mb-2">Kilometer Splits</h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Km</th>
                  <th className="border p-2">Pace (min/km)</th>
                  <th className="border p-2">Cumulative Time</th>
                </tr>
              </thead>
              <tbody>
                {/* Rows for all splits (1-42km) */}
                {Array.from({ length: isHalfMarathon ? Math.ceil(HALF_MARATHON_KM) : 42 }, (_, i) => i + 1).map(km => (
                  <tr key={km} className={km % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="border p-2 text-center">{km}</td>
                    <td className="border p-2">
                      <input
                        className="w-full px-2 py-1 border rounded"
                        type="text"
                        defaultValue={formatPace(kmPaces[km] || 0)}
                        key={`km-${km}-${kmPaces[km]}`} // Add key to force re-render when pace changes
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleKmPaceChange(km, e.target.value);
                            // Prevent form submission
                            e.preventDefault();
                          }
                        }}
                        onFocus={(e) => {
                          // Select all text when focused
                          e.target.select();
                        }}
                        onBlur={(e) => {
                          // Reset to current value on blur without saving changes
                          e.target.value = formatPace(kmPaces[km] || 0);
                        }}
                      />
                    </td>
                    <td className="border p-2 text-center">{formatTime(getCumulativeTime(km))}</td>
                  </tr>
                ))}
                
                {/* Final row for the finish */}
                <tr className="bg-blue-100 font-bold">
                  <td className="border p-2 text-center">{activeDistance.toFixed(3)}</td>
                  <td className="border p-2">
                    <input
                      className="w-full px-2 py-1 border rounded"
                      type="text"
                      defaultValue={formatPace(kmPaces[isHalfMarathon ? Math.ceil(HALF_MARATHON_KM) : 42] || 0)}
                      key={`km-final-${kmPaces[isHalfMarathon ? Math.ceil(HALF_MARATHON_KM) : 42]}`} // Add key to force re-render when pace changes
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleKmPaceChange(isHalfMarathon ? Math.ceil(HALF_MARATHON_KM) : 42, e.target.value);
                          // Prevent form submission
                          e.preventDefault();
                        }
                      }}
                      onFocus={(e) => {
                        // Select all text when focused
                        e.target.select();
                      }}
                      onBlur={(e) => {
                        // Reset to current value on blur without saving changes
                        e.target.value = formatPace(kmPaces[isHalfMarathon ? Math.ceil(HALF_MARATHON_KM) : 42] || 0);
                      }}
                    />
                  </td>
                  <td className="border p-2 text-center">{formatTime(getCumulativeTime(activeDistance))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarathonCalculator;