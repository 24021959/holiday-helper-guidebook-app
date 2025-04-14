
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { MessageSquare, Users, MessageCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"; 
import { ChatbotStats } from "@/hooks/chatbot/chatbotTypes";

interface AnalyticsOverviewProps {
  stats: ChatbotStats[];
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ stats }) => {
  const totalMessages = stats ? stats.reduce((sum, day) => sum + (day.total_messages || 0), 0) : 0;
  const totalConversations = stats ? stats.reduce((sum, day) => sum + (day.total_conversations || 0), 0) : 0;
  const avgMessagesPerConversation = totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : '0';
  
  // Calcola la variazione percentuale rispetto al giorno precedente
  const getPercentageChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const lastDayStats = stats && stats.length > 0 ? stats[stats.length - 1] : null;
  const previousDayStats = stats && stats.length > 1 ? stats[stats.length - 2] : null;
  
  const messagesChange = lastDayStats && previousDayStats 
    ? getPercentageChange(lastDayStats.total_messages, previousDayStats.total_messages)
    : 0;
    
  const conversationsChange = lastDayStats && previousDayStats
    ? getPercentageChange(lastDayStats.total_conversations, previousDayStats.total_conversations)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messaggi Totali</p>
                  <h3 className="text-2xl font-bold">{totalMessages}</h3>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${messagesChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {messagesChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(messagesChange).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversazioni</p>
                  <h3 className="text-2xl font-bold">{totalConversations}</h3>
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${conversationsChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {conversationsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(conversationsChange).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Media Messaggi/Conv.</p>
                  <h3 className="text-2xl font-bold">{avgMessagesPerConversation}</h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Andamento Messaggi</CardTitle>
            <CardDescription>Ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats && stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...stats].reverse()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                      contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_messages" 
                      stroke="#10b981" 
                      name="Messaggi"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Nessun dato disponibile</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Conversazioni Giornaliere</CardTitle>
            <CardDescription>Ultimi 30 giorni</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats && stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...stats].reverse()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                      contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                    />
                    <Bar 
                      dataKey="total_conversations" 
                      fill="#3b82f6" 
                      name="Conversazioni"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Nessun dato disponibile</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
