import { ToDo, Item } from "./core";
const filepath = "./lista.json";
const todo = new ToDo(filepath);
const port = 3000;

const server = Bun.serve({
  port: port,
  async fetch(request: Request) {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

    if (pathname === "/" && method === "GET") {
      return new Response(Bun.file("index.html"));
    }
    if (pathname === "/style.css" && method === "GET") {
      return new Response(Bun.file("style.css"));
    }
    if (pathname === "/app.js" && method === "GET") {
      return new Response(Bun.file("app.js"));
    }

    if (pathname === "/items" && method === "GET") {
      const items = await todo.getItems();
      const itemsData = items.map(item => item.toJSON());
      return new Response(JSON.stringify(itemsData), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (pathname === "/items" && method === "POST") {
      try {
        const body = await request.json();
        const { description } = body;
        
        if (!description || typeof description !== 'string') {
          return new Response(JSON.stringify({ error: "Descrição é obrigatória e deve ser texto." }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const item = new Item(description);
        await todo.addItem(item);
        
        return new Response(JSON.stringify({ message: "Item adicionado", item: item.toJSON() }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Falha ao adicionar item" }), { status: 500 });
      }
    }

    if (pathname === "/items" && method === "PUT") {
      try {
        const index = parseInt(searchParams.get("index") || "");
        
        if (isNaN(index)) {
          return new Response(JSON.stringify({ error: "Parâmetro index inválido" }), { status: 400 });
        }

        const body = await request.json();
        const { description } = body;

        if (!description) {
          return new Response(JSON.stringify({ error: "Descrição é obrigatória" }), { status: 400 });
        }

        const item = new Item(description);
        await todo.updateItem(index, item);

        return new Response(JSON.stringify({ message: "Item atualizado" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
    }

    if (pathname === "/items" && method === "DELETE") {
      try {
        const index = parseInt(searchParams.get("index") || "");
        
        if (isNaN(index)) {
          return new Response(JSON.stringify({ error: "Parâmetro index inválido" }), { status: 400 });
        }

        await todo.removeItem(index);
        
        return new Response(JSON.stringify({ message: "Item removido com sucesso" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ error: "Rota não encontrada" }), { status: 404 });
  }
});

console.log(`🚀 Servidor rodando em http://localhost:${port}`);