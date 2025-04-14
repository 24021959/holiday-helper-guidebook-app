
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ChatbotAnalytics = () => {
  const { data: stats } = useQuery({
    queryKey: ['chatbot-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
        
      if (error) throw error;
      return data;
    }
  });

  const { data: recentConversations } = useQuery({
    queryKey: ['chatbot-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Conversazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.reduce((sum, day) => sum + (day.total_conversations || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messaggi Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.reduce((sum, day) => sum + (day.total_messages || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Medio di Risposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.[0]?.average_response_time?.toFixed(2) || '0'} s
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso di Successo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.[0]?.helpful_responses && stats?.[0]?.total_messages
                ? ((stats[0].helpful_responses / stats[0].total_messages) * 100).toFixed(1)
                : '0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Andamento Messaggi</CardTitle>
          <CardDescription>Numero di messaggi per giorno negli ultimi 30 giorni</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.reverse()}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversazioni Recenti</CardTitle>
          <CardDescription>Ultime 50 interazioni con il chatbot</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Domanda</TableHead>
                <TableHead>Risposta</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentConversations?.map((conv) => (
                <TableRow key={conv.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(conv.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {conv.user_message}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {conv.bot_response}
                  </TableCell>
                  <TableCell>
                    {conv.was_helpful === true ? '👍' : 
                     conv.was_helpful === false ? '👎' : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotAnalytics;
