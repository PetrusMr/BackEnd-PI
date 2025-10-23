const { db } = require('./firebase-config');

// Operações para USUARIOS
const usuarios = {
  async login(email, senha) {
    const snapshot = await db.collection('usuarios')
      .where('email', '==', email)
      .where('senha', '==', senha)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data();
  },

  async create(userData) {
    const docRef = await db.collection('usuarios').add({
      ...userData,
      created_at: new Date()
    });
    return docRef.id;
  }
};

// Operações para AGENDAMENTOS
const agendamentos = {
  async getByUser(userId) {
    const snapshot = await db.collection('agendamentos')
      .where('user_id', '==', userId)
      .orderBy('data_agendamento', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(agendamentoData) {
    const docRef = await db.collection('agendamentos').add({
      ...agendamentoData,
      created_at: new Date()
    });
    return docRef.id;
  },

  async update(id, updateData) {
    await db.collection('agendamentos').doc(id).update({
      ...updateData,
      updated_at: new Date()
    });
  },

  async delete(id) {
    await db.collection('agendamentos').doc(id).delete();
  }
};

// Operações para HISTORICO_AGENDAMENTOS
const historicoAgendamentos = {
  async create(historicoData) {
    const docRef = await db.collection('historico_agendamentos').add({
      ...historicoData,
      created_at: new Date()
    });
    return docRef.id;
  },

  async getByUser(userId) {
    const snapshot = await db.collection('historico_agendamentos')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Operações para SCANS
const scans = {
  async create(scanData) {
    const docRef = await db.collection('scans').add({
      ...scanData,
      created_at: new Date()
    });
    return docRef.id;
  },

  async getByAgendamento(agendamentoId) {
    const snapshot = await db.collection('scans')
      .where('agendamento_id', '==', agendamentoId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = {
  usuarios,
  agendamentos,
  historicoAgendamentos,
  scans
};