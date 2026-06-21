import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import DrillDown from "@/pages/DrillDown";
import WeeklyReport from "@/pages/WeeklyReport";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drilldown" element={<DrillDown />} />
          <Route path="/weekly" element={<WeeklyReport />} />
        </Route>
      </Routes>
    </Router>
  );
}
