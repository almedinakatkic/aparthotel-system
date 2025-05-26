import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, textAlign: 'center' },
  section: { marginBottom: 10 },
  stat: { marginBottom: 5 }
});

const GeneralReportPDF = ({ report }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>General Report #{report.gReportID}</Text>
        <Text>Date: {report.reportDate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.stat}>Daily Income: ${report.dailyIncome.toLocaleString()}</Text>
        <Text style={styles.stat}>Monthly Income: ${report.monthlyIncome.toLocaleString()}</Text>
        <Text style={styles.stat}>Yearly Income: ${report.yearlyIncome.toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);

export default GeneralReportPDF;