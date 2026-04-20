export class Item {
  private description: string;

  constructor(description: string) {
    this.description = description;
  }

  updateDescription(newDescription: string) {
    this.description = newDescription;
  }

  toJSON() {
    return {
      description: this.description
    }
  }
}

export class ToDo {
  private filepath: string;
  private items: Promise<Item[]>;

  constructor(filepath: string) {
    this.filepath = filepath;
    this.items = this.loadFromFile();
  }

  private async saveToFile() {
    try {
      const items = await this.items;
      const file = Bun.file(this.filepath);
      const data = JSON.stringify(items);
      return Bun.write(file, data);
    } catch (error) {
      console.error('Erro ao salvar no arquivo:', error);
    }
  }

  private async loadFromFile() {
    const file = Bun.file(this.filepath);
    if (!(await file.exists()))
      return []
    const data = await file.text();
    return JSON.parse(data).map((itemData: any) => new Item(itemData.description));
  }

  async addItem(item: Item) {
    const items = await this.items;
    items.push(item);
    this.saveToFile();
  }

  async getItems() {
    return await this.items
  }

  async updateItem(index: number, newItem: Item) {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Índice fora dos limites');
    items[index] = newItem;
    this.saveToFile();
  }

  async removeItem(index: number) {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Índice fora dos limites');
    items.splice(index, 1);
    this.saveToFile();
  }
}