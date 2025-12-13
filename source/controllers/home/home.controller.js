
export default new class homeController
{
    /**
     * 
     * @param { Request } req 
     * @param { Response } res 
     */
    async index(req, res)
    {
        return res.status(200).json({
            status: "Ok!",
            message: "Server online and operant."
        });
    }
}