#!/bin/bash

# Diretório das migrações
MIGRATIONS_DIR="supabase/migrations"

# Listar todos os arquivos .sql e renomear
for file in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$file" ]; then
        # Extrair o nome base do arquivo (sem o timestamp)
        base_name=$(basename "$file" | sed 's/^[0-9]*_//')
        
        # Gerar novo timestamp
        new_timestamp=$(date +%Y%m%d%H%M%S)
        
        # Criar novo nome de arquivo
        new_name="$MIGRATIONS_DIR/${new_timestamp}_${base_name}"
        
        # Renomear o arquivo
        mv "$file" "$new_name"
        echo "Renomeado: $file -> $new_name"
        
        # Aguardar 1 segundo para garantir timestamps únicos
        sleep 1
    fi
done 