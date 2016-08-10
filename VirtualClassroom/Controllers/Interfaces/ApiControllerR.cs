using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers.Interfaces
{
    public class ApiControllerR : ApiController
    {
        protected DataResponse<T> responseError<T>(string errorMessage)
        {
            DataResponse<T> response = new DataResponse<T>();

            response.status = VC.RESPONSE_ERROR;
            response.message = errorMessage;

            return response;
        }
        protected DataResponse<T> responseSuccess<T>(T data)
        {
            DataResponse<T> response = new DataResponse<T>();

            response.status = VC.RESPONSE_SUCCESS;
            response.data = data;

            return response;
        }
    }
}
