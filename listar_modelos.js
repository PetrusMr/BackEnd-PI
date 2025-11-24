async function listarModelos() {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0');
    
    console.log('Status:', response.status);
    const data = await response.json();
    
    if (data.models) {
      console.log('Modelos disponíveis:');
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Métodos: ${model.supportedGenerationMethods?.join(', ')}`);
      });
    } else {
      console.log('Resposta:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

listarModelos();