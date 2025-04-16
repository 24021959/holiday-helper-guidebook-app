
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Activity } from "lucide-react";

const AnalyticsDashboard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <span>Analytics</span>
        </CardTitle>
        <CardDescription>
          Statistiche e metriche del chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2 text-gray-700">
          <p>Analytics del chatbot verranno aggiunte qui</p>
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
