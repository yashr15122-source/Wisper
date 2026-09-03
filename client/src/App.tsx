import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PublicSend from "./pages/PublicSend";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

const qc=new QueryClient();

export default function App(){
 return <QueryClientProvider client={qc}><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/,"")}><Routes>
  <Route path="/auth" element={<Auth/>}/>
  <Route path="/dashboard" element={<Dashboard/>}/>
  <Route path="/:username" element={<PublicSend/>}/>
  <Route path="/" element={<Navigate to="/auth" replace/>}/>
 </Routes></BrowserRouter></QueryClientProvider>
}
