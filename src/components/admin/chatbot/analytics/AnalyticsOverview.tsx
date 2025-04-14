
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { MessageSquare, HelpCircle } from "lucide-react"; // Added missing icon imports
import { ChatbotStats } from "@/hooks/chatbot/chatbotTypes";

interface AnalyticsOverviewProps {
  stats: ChatbotStats[];
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ stats }) => {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Messaggi</CardTitle>
            <CardDescription>Numero di messaggi per giorno negli ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats && stats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...stats].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_messages" 
                    stroke="#4ade80" 
                    name="Messaggi"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Nessun dato disponibile</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversazioni</CardTitle>
            <CardDescription>Numero di conversazioni per giorno</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats && stats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...stats].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                  />
                  <Bar 
                    dataKey="total_conversations" 
                    fill="#60a5fa" 
                    name="Conversazioni"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Nessun dato disponibile</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Statistiche</CardTitle>
          <CardDescription>Statistiche generali del chatbot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-emerald-500 mr-3" />
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Messaggi Totali</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {stats ? stats.reduce((sum, day) => sum + (day.total_messages || 0), 0) : 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Conversazioni Totali</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats ? stats.reduce((sum, day) => sum + (day.total_conversations || 0), 0) : 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-amber-500 mr-3" />
                <div>
                  <p className="text-sm text-amber-600 font-medium">Messaggi per Conversazione</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {stats && stats.length > 0 
                      ? (stats.reduce((sum, day) => sum + (day.total_messages || 0), 0) / 
                         stats.reduce((sum, day) => sum + (day.total_conversations || 0), 0)).toFixed(1) 
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AnalyticsOverview;
