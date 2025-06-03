import React from 'react';
import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 14,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: 'center'
  },
  line: {
    marginBottom: 12,
    fontSize: 16
  }
});

const GeneralReportPDF = ({ report }) => {
  const label = report?.label || 'N/A';
  const income = report?.totalIncome != null ? `${report.totalIncome} €` : 'N/A';

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>General Income Report</Text>
        <Text style={styles.line}>Date: {label}</Text>
        <Text style={styles.line}>Total Income: {income}</Text>
      </Page>
    </Document>
  );
};

export default GeneralReportPDF;
