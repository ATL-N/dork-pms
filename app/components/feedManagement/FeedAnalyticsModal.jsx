// app/components/feedManagement/FeedAnalyticsModal.js
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const FeedAnalyticsModal = ({
  onClose,
  feedInventory,
  feedConsumption,
  feedFormulations,
}) => {
  // Calculate daily consumption data for chart
  const consumptionChartData = (() => {
    const dataMap = {};

    feedConsumption.forEach((record) => {
      const date = record.date;
      if (!dataMap[date]) {
        dataMap[date] = { date, totalQuantity: 0 };
      }
      dataMap[date].totalQuantity += record.quantity;
    });

    return Object.values(dataMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  })();

  // Calculate total consumption by feed type
  const consumptionByFeedTypeData = (() => {
    const data = {};
    feedConsumption.forEach((record) => {
      const feedId = record.feedId;
      if (!data[feedId]) {
        //  Find the feed item to get its name and unit.  Handle missing feed gracefully
        const feedItem = feedInventory.find((f) => f.id === feedId);
        data[feedId] = {
          feedId: feedId,
          feedName: feedItem ? feedItem.name : `Unknown Feed (${feedId})`, //  Handle missing feed
          totalQuantity: 0,
          unit: feedItem ? feedItem.unit : "units", // Use a generic unit if feed is missing
        };
      }
      data[feedId].totalQuantity += record.quantity;
    });
    return Object.values(data);
  })();

  // Calculate feed by category for chart
  const feedByCategoryData = (() => {
    const data = {};
    feedInventory.forEach((item) => {
      const category = item.category;
      if (!data[category]) {
        data[category] = { category, quantity: 0, value: 0 };
      }
      data[category].quantity += item.quantity;
      data[category].value += item.quantity * item.unitPrice;
    });

    return Object.values(data);
  })();

  // Calculate number of formulations
  const numberOfFormulations = feedFormulations.length;

  // Example color palette
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF19A3",
  ];

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Feed Analytics
      </h2>
      <div className="space-y-6">
        {/* Daily Feed Consumption */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium mb-3">Daily Feed Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  label={{
                    value: "Quantity (kg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, "Consumption"]}
                />
                <Line
                  type="monotone"
                  dataKey="totalQuantity"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Consumption by Feed Type */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium mb-3">Total Consumption by Feed Type</h3>
          <div className="h-96">
            {" "}
            {/* Larger chart */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionByFeedTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feedName" />
                <YAxis
                  label={{
                    value: `Quantity`,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} ${props.payload.unit}`,
                    "Consumption",
                  ]}
                />
                <Legend />
                <Bar dataKey="totalQuantity" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feed Inventory by Category (Pie Chart) */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium mb-3">Feed Inventory by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feedByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="quantity"
                  nameKey="category"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={COLORS[index % COLORS.length]}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {feedByCategoryData[index].category} ({value})
                      </text>
                    );
                  }}
                >
                  {feedByCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Number of Formulations */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Number of Formulations</h3>
          <p className="text-3xl font-bold">{numberOfFormulations}</p>
        </div>
      </div>
    </>
  );
};

export default FeedAnalyticsModal;
