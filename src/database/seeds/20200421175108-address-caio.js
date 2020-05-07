// seed de criação de destinatário teste
module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'recipients',
      [
        {
          name: 'Caio Henrique Barutti Furtado',
          street: 'Rua Maria Luiza Bettini Citroni',
          number: '140',
          state: 'São Paulo',
          city: 'Boituva',
          zip_code: 18550000,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },
  down: () => {},
};
