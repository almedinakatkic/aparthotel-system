import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, textAlign: 'center' },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontWeight: 'bold' }
});

const FinancialReportPDF = ({ report, totals }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Report #{report.reportID}</Text>
        <Text>Date: {report.date}</Text>
      </View>

      <View style={styles.section}>
        <Text>Apartment: {report.apartment}</Text>
        <Text>Rental Income: ${report.rental.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text>Expenses:</Text>
        <View style={styles.row}>
          <Text>Maintenance:</Text>
          <Text>${report.expenses.maintenance.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Cleaning:</Text>
          <Text>${report.expenses.cleaning.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Expenses:</Text>
          <Text>${totals.totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text>Distribution:</Text>
        <View style={styles.row}>
          <Text>Net Income:</Text>
          <Text>${totals.netIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Company Share ({report.companyShare}%):</Text>
          <Text>${(totals.netIncome * report.companyShare/100).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Owner Share ({report.ownerShare}%):</Text>
          <Text>${(totals.netIncome * report.ownerShare/100).toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default FinancialReportPDF;