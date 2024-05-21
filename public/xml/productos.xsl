<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="/">
    <html>
    <head>
      <title>Lista de Productos</title>
      <link rel="stylesheet" type="text/css" href="style.css"/>
    </head>
    <body>
      <h1>Lista de Productos</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="productos/producto">
            <tr>
              <td><xsl:value-of select="name"/></td>
              <td><xsl:value-of select="price"/></td>
              <td><xsl:value-of select="category"/></td>
              <td><xsl:value-of select="stock"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
      <h2>Total y Porcentaje</h2>
      <p>Total: <xsl:value-of select="sum(productos/producto/price)"/></p>
      <p>Porcentaje de Categoría A: 
        <xsl:value-of select="sum(productos/producto[category='A']/prepricecio) div sum(productos/producto/price) * 100"/>%
      </p>
    </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
