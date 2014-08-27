 <?php

 if(!empty($_POST['nombre']) AND !empty($_POST['email']) AND !empty($_POST['asunto'])){

$to ="tumx@tu-mx.com";
$headers = "Content-Type: text/html; charset=iso-8859-1\n"; 
$headers .= "From:".$_POST['email']."\r\n";			
$tema="Contacto desde el Sitio Web TU/MX";
$mensaje="
<table border='0' cellspacing='2' cellpadding='2'>
  <tr>
    <td width='20%' align='center' bgcolor='#FF8302'><strong>Nombre:</strong></td>
    <td width='80%' align='left'>$_POST[nombre]</td>
  </tr>
  <tr>
    <td align='center' bgcolor='#FF8302'><strong>E-mail:</strong></td>
    <td align='left'>$_POST[email]</td>
  </tr>
   <tr>
    <td width='20%' align='center' bgcolor='#FF8302'><strong>Asunto</strong></td>
    <td width='80%' align='left'>$_POST[asunto]</td>
  </tr>
</table>
";
@mail($to,$tema,$mensaje,$headers); 
  echo "Se envío correo satisfactoriamente";
} else {
  
	echo "No se envío correo satisfactoriamente";
}
?>