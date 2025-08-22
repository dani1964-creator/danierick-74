-- Verificar a função de validação que pode estar causando o problema
SELECT prosrc FROM pg_proc WHERE proname = 'validate_lead_input';