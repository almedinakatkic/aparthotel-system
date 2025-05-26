import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, textAlign: 'center' },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontWeight: 'bold' },
  total: { borderTop: '1px solid #000', paddingTop: 5, marginTop: 5 }
});

const OwnerReportPDF = ({ report }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Owner Report #{report.oReportID}</Text>
        <Text>Date: {report.date}</Text>
      </View>

      <View style={styles.section}>
        <Text>Apartment: {report.apartment}</Text>
        <Text>Rental Income: ${report.rentalIncome.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text>Expenses Deducted:</Text>
        <View style={styles.row}>
          <Text>Maintenance:</Text>
          <Text>${report.expenses.maintenance.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Cleaning:</Text>
          <Text>${report.expenses.cleaning.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text style={styles.label}>Total Expenses:</Text>
          <Text>${(report.expenses.maintenance + report.expenses.cleaning).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Owner Income:</Text>
        <Text>${report.ownerIncome.toFixed(2)}</Text>
      </View>
    </Page>
  </Document>
);

export default OwnerReportPDF;