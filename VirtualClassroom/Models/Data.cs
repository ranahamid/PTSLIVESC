using System.ComponentModel;

namespace VirtualClassroom.Models
{
    [DataObject]
    public class DataResponse<T>
    {
        public string status { get; set; }
        public string message { get; set; }
        public T data { get; set; }
    }
}
