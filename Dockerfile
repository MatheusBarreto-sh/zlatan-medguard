# Usa uma base oficial do Python super leve
FROM python:3.10-slim

# Instala o motor Tesseract OCR e o pacote de idioma Português no sistema Linux
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-por

# Configura a pasta de trabalho do servidor
WORKDIR /app

# Copia a lista de dependências e instala as bibliotecas Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do seu código
COPY . .

# Comando final que liga a API na nuvem e expõe a porta
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]