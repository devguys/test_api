'user strict';
 var config =   {
    adapter : [
        {
            sql : 
                {
                    host        :  'localhost',
                    user        :  'root',
                    password    :  'root',
                    database    :  'local-chat',
                }
            
        },
        {
            mongo : 
                {
                    host        :  '127.0.0.1',
                    user        :  '',
                    password    :  '',
                    database    :  ''
                }
            
        }
    ]  
}
module.exports = config;