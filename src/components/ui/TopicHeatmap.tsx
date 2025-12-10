import type { SourceTopicMatrix } from '../../types';

interface TopicHeatmapProps {
  sourceMatrix: SourceTopicMatrix;
  maxSources?: number;
}

/**
 * Heatmap showing topic coverage by source
 */
export function TopicHeatmap({
  sourceMatrix,
  maxSources = 10,
}: TopicHeatmapProps) {
  const sources = Object.keys(sourceMatrix).slice(0, maxSources);

  // Collect all unique topics
  const allTopics = new Set<string>();
  sources.forEach(source => {
    Object.keys(sourceMatrix[source]).forEach(topic => allTopics.add(topic));
  });
  const topics = Array.from(allTopics);

  // Find max for color scaling
  let maxCount = 0;
  sources.forEach(source => {
    Object.values(sourceMatrix[source]).forEach(count => {
      if (count > maxCount) maxCount = count;
    });
  });

  if (sources.length === 0 || topics.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Source × Topic Matrix
        </h3>
        <p className="text-xs text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">
        Source × Topic Matrix
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 text-slate-500 sticky left-0 bg-slate-900">
                Source
              </th>
              {topics.map(topic => (
                <th
                  key={topic}
                  className="p-2 text-slate-500 whitespace-nowrap text-center font-normal"
                >
                  {topic}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map(source => (
              <tr key={source} className="border-t border-slate-800/50">
                <td className="p-2 text-slate-400 truncate max-w-[120px] sticky left-0 bg-slate-900">
                  {source}
                </td>
                {topics.map(topic => {
                  const count = sourceMatrix[source][topic] || 0;
                  const intensity = maxCount > 0 ? count / maxCount : 0;

                  return (
                    <td
                      key={topic}
                      className="p-2 text-center"
                      style={{
                        backgroundColor: count > 0
                          ? `rgba(99, 102, 241, ${Math.max(0.1, intensity)})`
                          : 'transparent',
                        color: intensity > 0.5 ? 'white' : '#94a3b8',
                      }}
                    >
                      {count > 0 ? count : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(sourceMatrix).length > maxSources && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Showing top {maxSources} sources
        </p>
      )}
    </div>
  );
}

export default TopicHeatmap;
