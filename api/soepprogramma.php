<?php
getSoepen();
function getSoepen(){
    $sql="select * FROM soep ORDER BY naam";
    try{
        $db=getConnection();
        $stmt=$db->query($sql);
        $soepen=$stmt->fetchAll(PDO::FETCH_OBJ);
        $db=null;

        echo json_encode($soepen);
    } catch(PDOException $e){
        echo '{"error":{"text":'.$e->getMessage().'}}';

    }

}

function getConnection(){
    $dbhost='mysqlhost.jouwdomein.be';
    $dbuser='A000736';
    $dbpass='torralba69';
    $dbname='A000736';
    $dbh=new PDO("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    return $dbh;
}