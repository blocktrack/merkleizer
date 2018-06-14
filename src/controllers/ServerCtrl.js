module.exports={
	info:info
}

function info(req,res){
	res.status(200).json({"running": 1})
}
